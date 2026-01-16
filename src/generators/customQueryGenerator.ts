import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { extractPackageName } from "../utils/fileUtils";

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
    const folderPath = uri ? uri.fsPath : undefined;
    
    if (!folderPath) {
      vscode.window.showErrorMessage("Please select a folder first!");
      return;
    }

    // Get entity name
    const entityName = await vscode.window.showInputBox({
      prompt: "Enter entity name",
      placeHolder: "User, Product, Order",
      ignoreFocusOut: true,
    });

    if (!entityName) {
      return;
    }

    // Get ID type
    const idType = await vscode.window.showQuickPick(
      ["Long", "Integer", "String", "UUID"],
      {
        placeHolder: "Select ID data type",
        ignoreFocusOut: true,
      }
    );

    if (!idType) {
      return;
    }

    const config: CustomQueryConfig = {
      repositoryName: `${entityName}Repository`,
      entityName,
      idType,
      queries: [],
    };

    // Collect custom queries
    let addMore = true;
    while (addMore) {
      const query = await collectCustomQuery(entityName);
      if (query) {
        config.queries.push(query);
        
        const addAnother = await vscode.window.showQuickPick(
          ["Yes", "No"],
          {
            placeHolder: "Add another query method?",
            ignoreFocusOut: true,
          }
        );
        
        addMore = addAnother === "Yes";
      } else {
        addMore = false;
      }
    }

    if (config.queries.length === 0) {
      vscode.window.showWarningMessage("No queries added!");
      return;
    }

    // Generate repository
    const content = generateCustomQueryRepository(config, folderPath);
    const fileName = `${entityName}Repository.java`;
    const filePath = path.join(folderPath, fileName);
    
    // Write file
    fs.writeFileSync(filePath, content);

    // Open the file
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

async function collectCustomQuery(entityName: string): Promise<CustomQuery | null> {
  // Get method name
  const methodName = await vscode.window.showInputBox({
    prompt: "Enter method name",
    placeHolder: "findByEmail, findActiveUsers, updateStatus",
    ignoreFocusOut: true,
  });

  if (!methodName) {
    return null;
  }

  // Get query type
  const queryType = await vscode.window.showQuickPick(
    [
      { label: "SELECT", description: "Retrieve data" },
      { label: "UPDATE", description: "Modify data" },
      { label: "DELETE", description: "Remove data" },
      { label: "NATIVE", description: "Native SQL query" },
    ],
    {
      placeHolder: "Select query type",
      ignoreFocusOut: true,
    }
  );

  if (!queryType) {
    return null;
  }

  // Get return type
  const returnType = await vscode.window.showQuickPick(
    [
      { label: "Single", description: `Returns single ${entityName}` },
      { label: "List", description: `Returns List<${entityName}>` },
      { label: "Page", description: `Returns Page<${entityName}>` },
      { label: "Optional", description: `Returns Optional<${entityName}>` },
      { label: "Count", description: "Returns Long (count)" },
      { label: "Boolean", description: "Returns boolean" },
      { label: "Void", description: "No return (for updates/deletes)" },
    ],
    {
      placeHolder: "Select return type",
      ignoreFocusOut: true,
    }
  );

  if (!returnType) {
    return null;
  }

  // Collect parameters
  const parameters: Array<{ name: string; type: string }> = [];
  let addMoreParams = true;
  
  while (addMoreParams) {
    const paramName = await vscode.window.showInputBox({
      prompt: "Enter parameter name (leave empty to finish)",
      placeHolder: "email, status, userId",
      ignoreFocusOut: true,
    });

    if (!paramName) {
      break;
    }

    const paramType = await vscode.window.showInputBox({
      prompt: `Enter type for parameter '${paramName}'`,
      placeHolder: "String, Long, Boolean, LocalDateTime",
      ignoreFocusOut: true,
    });

    if (paramType) {
      parameters.push({ name: paramName, type: paramType });
    }
  }

  // Get custom query (optional for derived queries)
  let customQuery: string | undefined;
  
  if (queryType.label === "NATIVE" || queryType.label === "UPDATE" || queryType.label === "DELETE") {
    customQuery = await vscode.window.showInputBox({
      prompt: "Enter custom query",
      placeHolder: `SELECT * FROM ${entityName.toLowerCase()} WHERE ...`,
      ignoreFocusOut: true,
    });
  }

  return {
    methodName,
    queryType: queryType.label as any,
    returnType: returnType.label as any,
    parameters,
    query: customQuery,
  };
}

function generateCustomQueryRepository(
  config: CustomQueryConfig,
  folderPath: string
): string {
  const packageName = extractPackageName(folderPath);
  
  let content = `package ${packageName};\n\n`;
  
  // Imports
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

  // JavaDoc
  content += `/**\n`;
  content += ` * Repository interface for ${config.entityName} entity\n`;
  content += ` * Contains custom query methods\n`;
  content += ` */\n`;
  content += `@Repository\n`;
  content += `public interface ${config.repositoryName} extends JpaRepository<${config.entityName}, ${config.idType}> {\n\n`;

  // Generate query methods
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

  // Add annotations
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

  // Method signature
  const returnType = getReturnTypeName(query.returnType, entityName);
  method += `    ${returnType} ${query.methodName}(`;
  
  if (query.parameters.length > 0) {
    method += query.parameters
      .map((param) => `@Param("${param.name}") ${param.type} ${param.name}`)
      .join(", ");
  }
  
  // Add Pageable for Page return type
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
