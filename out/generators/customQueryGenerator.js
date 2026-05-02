"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuerySuggestions = exports.createCustomQueryRepository = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const fileUtils_1 = require("../utils/fileUtils");
const validation_1 = require("../utils/validation");
const FormPanel_1 = require("../forms/FormPanel");
const customQuerySchema_1 = require("../forms/schemas/customQuerySchema");
const utils_1 = require("../forms/utils");
async function createCustomQueryRepository(uri) {
    try {
        const folderPath = (0, validation_1.requireFolderPath)(uri);
        if (!folderPath) {
            return;
        }
        const result = await (0, FormPanel_1.showForm)(customQuerySchema_1.customQuerySchema);
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
        vscode.window.showInformationMessage(`✅ Repository with ${config.queries.length} custom queries created!`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to create custom query repository: ${error.message}`);
    }
}
exports.createCustomQueryRepository = createCustomQueryRepository;
function formResultToCustomQueryConfig(result) {
    const entityName = (0, utils_1.getString)(result, "entityName");
    const queries = (0, utils_1.getList)(result, "queries").map((q) => ({
        methodName: q.methodName,
        queryType: q.queryType,
        returnType: q.returnType,
        parameters: (0, utils_1.getList)(q, "parameters").map((p) => ({
            name: p.name,
            type: p.type,
        })),
        query: (0, utils_1.getOptionalString)(q, "query"),
    }));
    return {
        repositoryName: `${entityName}Repository`,
        entityName,
        idType: result.idType,
        queries,
    };
}
function generateCustomQueryRepository(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
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
function generateQueryMethod(query, entityName) {
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
        }
        else {
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
function getReturnTypeName(returnType, entityName) {
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
async function generateQuerySuggestions(uri) {
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
    const selected = await vscode.window.showQuickPick(suggestions.map((s) => ({
        label: s.name,
        detail: s.example,
        description: s.description,
    })), {
        placeHolder: "Select a query pattern to see example",
        ignoreFocusOut: true,
    });
    if (selected) {
        vscode.window.showInformationMessage(`Example: ${selected.detail}\n${selected.description}`);
    }
}
exports.generateQuerySuggestions = generateQuerySuggestions;
//# sourceMappingURL=customQueryGenerator.js.map