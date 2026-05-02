"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVersionedController = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const fileUtils_1 = require("../utils/fileUtils");
const validation_1 = require("../utils/validation");
const FormPanel_1 = require("../forms/FormPanel");
const versioningSchema_1 = require("../forms/schemas/versioningSchema");
const utils_1 = require("../forms/utils");
async function createVersionedController(uri) {
    try {
        const folderPath = (0, validation_1.requireFolderPath)(uri);
        if (!folderPath) {
            return;
        }
        const result = await (0, FormPanel_1.showForm)(versioningSchema_1.versioningSchema);
        if (!result) {
            return;
        }
        const config = formResultToVersionedConfig(result);
        const content = generateVersionedControllerContent(config, folderPath);
        let targetPath = folderPath;
        if (config.includeVersionInPackage) {
            targetPath = path.join(folderPath, config.version);
            fs.mkdirSync(targetPath, { recursive: true });
        }
        const fileName = `${config.baseName}Controller${config.version.toUpperCase()}.java`;
        const filePath = path.join(targetPath, fileName);
        fs.writeFileSync(filePath, content);
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
        vscode.window.showInformationMessage(`✅ Versioned controller created: ${fileName}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to create versioned controller: ${error.message}`);
    }
}
exports.createVersionedController = createVersionedController;
function formResultToVersionedConfig(result) {
    const baseName = (0, utils_1.getString)(result, "baseName");
    const includeCrud = (0, utils_1.getBool)(result, "includeCrud");
    const entityName = (0, utils_1.getString)(result, "entityName");
    return {
        baseName,
        version: (0, utils_1.getString)(result, "version"),
        includeVersionInPath: (0, utils_1.getBool)(result, "includeVersionInPath"),
        includeVersionInPackage: (0, utils_1.getBool)(result, "includeVersionInPackage"),
        includeCrud,
        entityName: includeCrud ? (entityName || baseName) : undefined,
        idType: includeCrud ? (0, utils_1.getStringOr)(result, "idType", "Long") : undefined,
    };
}
function generateVersionedControllerContent(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    const versionSuffix = config.version.toUpperCase();
    const className = `${config.baseName}Controller${versionSuffix}`;
    let finalPackageName = packageName;
    if (config.includeVersionInPackage) {
        finalPackageName = `${packageName}.${config.version}`;
    }
    let content = `package ${finalPackageName};\n\n`;
    content += `import org.springframework.web.bind.annotation.*;\n`;
    if (config.includeCrud) {
        content += `import org.springframework.http.HttpStatus;\n`;
        content += `import org.springframework.http.ResponseEntity;\n`;
        content += `import java.util.List;\n\n`;
    }
    else {
        content += `\n`;
    }
    content += `/**\n`;
    content += ` * ${config.baseName} Controller - API Version ${config.version}\n`;
    content += ` * \n`;
    content += ` * This controller handles ${config.baseName.toLowerCase()} related operations for API ${config.version}\n`;
    content += ` */\n`;
    content += `@RestController\n`;
    const basePath = config.baseName.toLowerCase() + "s";
    if (config.includeVersionInPath) {
        content += `@RequestMapping("/api/${config.version}/${basePath}")\n`;
    }
    else {
        content += `@RequestMapping("/api/${basePath}")\n`;
    }
    content += `public class ${className} {\n\n`;
    if (config.includeCrud) {
        content += generateCrudMethods(config);
    }
    else {
        content += generateBasicMethods(config);
    }
    content += `}\n`;
    return content;
}
function generateCrudMethods(config) {
    const entityName = config.entityName || config.baseName;
    const idType = config.idType || "Long";
    const entityVar = entityName.charAt(0).toLowerCase() + entityName.slice(1);
    let methods = `    // TODO: Inject your service here\n`;
    methods += `    // private final ${entityName}Service ${entityVar}Service;\n\n`;
    methods += `    /**\n`;
    methods += `     * Get all ${entityName.toLowerCase()}s\n`;
    methods += `     * @return List of ${entityName}s\n`;
    methods += `     */\n`;
    methods += `    @GetMapping\n`;
    methods += `    public ResponseEntity<List<${entityName}>> getAll${entityName}s() {\n`;
    methods += `        // TODO: Implement service call\n`;
    methods += `        // return ResponseEntity.ok(${entityVar}Service.findAll());\n`;
    methods += `        return ResponseEntity.ok(List.of());\n`;
    methods += `    }\n\n`;
    methods += `    /**\n`;
    methods += `     * Get ${entityName.toLowerCase()} by ID\n`;
    methods += `     * @param id ${entityName} ID\n`;
    methods += `     * @return ${entityName} details\n`;
    methods += `     */\n`;
    methods += `    @GetMapping("/{id}")\n`;
    methods += `    public ResponseEntity<${entityName}> get${entityName}ById(@PathVariable ${idType} id) {\n`;
    methods += `        // TODO: Implement service call\n`;
    methods += `        // return ResponseEntity.ok(${entityVar}Service.findById(id));\n`;
    methods += `        return ResponseEntity.ok(new ${entityName}());\n`;
    methods += `    }\n\n`;
    methods += `    /**\n`;
    methods += `     * Create new ${entityName.toLowerCase()}\n`;
    methods += `     * @param ${entityVar} ${entityName} to create\n`;
    methods += `     * @return Created ${entityName}\n`;
    methods += `     */\n`;
    methods += `    @PostMapping\n`;
    methods += `    public ResponseEntity<${entityName}> create${entityName}(@RequestBody ${entityName} ${entityVar}) {\n`;
    methods += `        // TODO: Implement service call\n`;
    methods += `        // ${entityName} created = ${entityVar}Service.save(${entityVar});\n`;
    methods += `        // return ResponseEntity.status(HttpStatus.CREATED).body(created);\n`;
    methods += `        return ResponseEntity.status(HttpStatus.CREATED).body(${entityVar});\n`;
    methods += `    }\n\n`;
    methods += `    /**\n`;
    methods += `     * Update existing ${entityName.toLowerCase()}\n`;
    methods += `     * @param id ${entityName} ID\n`;
    methods += `     * @param ${entityVar} Updated ${entityName} data\n`;
    methods += `     * @return Updated ${entityName}\n`;
    methods += `     */\n`;
    methods += `    @PutMapping("/{id}")\n`;
    methods += `    public ResponseEntity<${entityName}> update${entityName}(\n`;
    methods += `            @PathVariable ${idType} id,\n`;
    methods += `            @RequestBody ${entityName} ${entityVar}) {\n`;
    methods += `        // TODO: Implement service call\n`;
    methods += `        // ${entityName} updated = ${entityVar}Service.update(id, ${entityVar});\n`;
    methods += `        // return ResponseEntity.ok(updated);\n`;
    methods += `        return ResponseEntity.ok(${entityVar});\n`;
    methods += `    }\n\n`;
    methods += `    /**\n`;
    methods += `     * Delete ${entityName.toLowerCase()}\n`;
    methods += `     * @param id ${entityName} ID\n`;
    methods += `     * @return No content\n`;
    methods += `     */\n`;
    methods += `    @DeleteMapping("/{id}")\n`;
    methods += `    public ResponseEntity<Void> delete${entityName}(@PathVariable ${idType} id) {\n`;
    methods += `        // TODO: Implement service call\n`;
    methods += `        // ${entityVar}Service.deleteById(id);\n`;
    methods += `        return ResponseEntity.noContent().build();\n`;
    methods += `    }\n`;
    return methods;
}
function generateBasicMethods(config) {
    const entityVar = config.baseName.charAt(0).toLowerCase() + config.baseName.slice(1);
    let methods = `    /**\n`;
    methods += `     * Sample endpoint for ${config.baseName}\n`;
    methods += `     * API Version: ${config.version}\n`;
    methods += `     */\n`;
    methods += `    @GetMapping\n`;
    methods += `    public ResponseEntity<String> get${config.baseName}s() {\n`;
    methods += `        return ResponseEntity.ok("${config.baseName} API ${config.version}");\n`;
    methods += `    }\n`;
    return methods;
}
//# sourceMappingURL=versioningGenerator.js.map