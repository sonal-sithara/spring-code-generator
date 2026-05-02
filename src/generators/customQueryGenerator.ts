import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { extractPackageName } from "../utils/fileUtils";
import { requireFolderPath } from "../utils/validation";
import { showForm } from "../forms/FormPanel";
import { customQuerySchema } from "../forms/schemas/customQuerySchema";
import { FormResult } from "../forms/types";
import { getList, getOptionalString, getString } from "../forms/utils";

export interface CustomQueryConfig {
  repositoryName: string;
  entityName: string;
  idType: string;
  queries: CustomQuery[];
}

export interface CustomQuery {
  methodName: string;
  queryType: "SELECT" | "UPDATE" | "DELETE" | "NATIVE";
  returnType: "Single" | "List" | "Page" | "Optional" | "Count" | "Boolean" | "Void";
  parameters: Array<{ name: string; type: string }>;
  query?: string;
}

export async function createCustomQueryRepository(uri: vscode.Uri | undefined) {
  try {
    const folderPath = requireFolderPath(uri);
    if (!folderPath) {
      return;
    }

    const result = await showForm(customQuerySchema);
    if (!result) {
      return;
    }

    const config = formResultToCustomQueryConfig(result);
    if (config.queries.length === 0) {
      vscode.window.showWarningMessage("No queries added!");
      return;
    }

    const content = generateCustomQueryRepository(config, folderPath);
    const fileName = `${config.entityName}Repository.java`;
    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, content);

    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      `✅ Repository with ${config.queries.length} custom queries created!`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to create custom query repository: ${error.message}`
    );
  }
}

function formResultToCustomQueryConfig(result: FormResult): CustomQueryConfig {
  const entityName = getString(result, "entityName");
  const queries: CustomQuery[] = getList(result, "queries").map((q) => ({
    methodName: q.methodName as string,
    queryType: q.queryType as CustomQuery["queryType"],
    returnType: q.returnType as CustomQuery["returnType"],
    parameters: getList(q, "parameters").map((p) => ({
      name: p.name as string,
      type: p.type as string,
    })),
    query: getOptionalString(q, "query"),
  }));

  return {
    repositoryName: `${entityName}Repository`,
    entityName,
    idType: result.idType as string,
    queries,
  };
}

function generateCustomQueryRepository(
  config: CustomQueryConfig,
  folderPath: string
): string {
  const packageName = extractPackageName(folderPath);
  
  let content = `package ${packageName};\n\n`;

  content += `import org.springframework.data.jpa.repository.JpaRepository;\n`;
  content += `import org.springframework.data.jpa.repository.Query;\n`;
  content += `import org.springframework.data.jpa.repository.Modifying;\n`;
  content += `import org.springframework.data.repository.query.Param;\n`;
  content += `import org.springframework.data.domain.Page;\n`;
  content += `import org.springframework.data.domain.Pageable;\n`;
  content += `import org.springframework.stereotype.Repository;\n`;
  content += `import org.springframework.transaction.annotation.Transactional;\n`;
  content += `import java.util.List;\n`;
  content += `import java.util.Optional;\n\n`;

  content += `/**\n`;
  content += ` * Repository interface for ${config.entityName} entity\n`;
  content += ` * Contains custom query methods\n`;
  content += ` */\n`;
  content += `@Repository\n`;
  content += `public interface ${config.repositoryName} extends JpaRepository<${config.entityName}, ${config.idType}> {\n\n`;

  config.queries.forEach((query, index) => {
    content += generateQueryMethod(query, config.entityName);
    if (index < config.queries.length - 1) {
      content += `\n`;
    }
  });

  content += `}\n`;

  return content;
}

function generateQueryMethod(query: CustomQuery, entityName: string): string {
  let method = `    /**\n`;
  method += `     * ${query.methodName}\n`;
  query.parameters.forEach((param) => {
    method += `     * @param ${param.name} ${param.type} parameter\n`;
  });
  
  const returnTypeName = getReturnTypeName(query.returnType, entityName);
  method += `     * @return ${returnTypeName}\n`;
  method += `     */\n`;

  if (query.query) {
    if (query.queryType === "NATIVE") {
      method += `    @Query(value = "${query.query}", nativeQuery = true)\n`;
    } else {
      method += `    @Query("${query.query}")\n`;
    }
  }

  if (query.queryType === "UPDATE" || query.queryType === "DELETE") {
    method += `    @Modifying\n`;
    method += `    @Transactional\n`;
  }

  const returnType = getReturnTypeName(query.returnType, entityName);
  method += `    ${returnType} ${query.methodName}(`;
  
  if (query.parameters.length > 0) {
    method += query.parameters
      .map((param) => `@Param("${param.name}") ${param.type} ${param.name}`)
      .join(", ");
  }

  if (query.returnType === "Page") {
    if (query.parameters.length > 0) {
      method += ", ";
    }
    method += "Pageable pageable";
  }
  
  method += `);\n`;

  return method;
}

function getReturnTypeName(returnType: string, entityName: string): string {
  switch (returnType) {
    case "Single":
      return entityName;
    case "List":
      return `List<${entityName}>`;
    case "Page":
      return `Page<${entityName}>`;
    case "Optional":
      return `Optional<${entityName}>`;
    case "Count":
      return "Long";
    case "Boolean":
      return "boolean";
    case "Void":
      return "void";
    default:
      return entityName;
  }
}

export async function generateQuerySuggestions(uri: vscode.Uri | undefined) {
  const suggestions = [
    {
      name: "Find by field",
      example: "findByEmail(String email)",
      description: "Derived query - no @Query needed",
    },
    {
      name: "Find with multiple conditions",
      example: "findByEmailAndActive(String email, boolean active)",
      description: "Derived query with AND",
    },
    {
      name: "Find with OR condition",
      example: "findByEmailOrUsername(String email, String username)",
      description: "Derived query with OR",
    },
    {
      name: "Find with Like",
      example: "findByNameContaining(String name)",
      description: "Partial match search",
    },
    {
      name: "Find with date range",
      example: "findByCreatedAtBetween(LocalDateTime start, LocalDateTime end)",
      description: "Date range query",
    },
    {
      name: "Find with sorting",
      example: "findByActiveOrderByCreatedAtDesc(boolean active)",
      description: "Sorted results",
    },
    {
      name: "Count query",
      example: "countByActive(boolean active)",
      description: "Returns count",
    },
    {
      name: "Exists query",
      example: "existsByEmail(String email)",
      description: "Returns boolean",
    },
    {
      name: "Delete query",
      example: "deleteByActive(boolean active)",
      description: "Delete by condition",
    },
    {
      name: "Top/First query",
      example: "findTop10ByOrderByCreatedAtDesc()",
      description: "Limit results",
    },
  ];

  const selected = await vscode.window.showQuickPick(
    suggestions.map((s) => ({
      label: s.name,
      detail: s.example,
      description: s.description,
    })),
    {
      placeHolder: "Select a query pattern to see example",
      ignoreFocusOut: true,
    }
  );

  if (selected) {
    vscode.window.showInformationMessage(
      `Example: ${selected.detail}\n${selected.description}`
    );
  }
}
