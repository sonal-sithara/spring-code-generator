"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVersionedController = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const fileUtils_1 = require("../utils/fileUtils");
async function createVersionedController(uri) {
    try {
        const folderPath = uri ? uri.fsPath : undefined;
        if (!folderPath) {
            vscode.window.showErrorMessage("Please select a folder first!");
            return;
        }
        // Get controller base name
        const baseName = await vscode.window.showInputBox({
            prompt: "Enter controller base name (without 'Controller' suffix)",
            placeHolder: "User, Product, Order",
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return "Controller name is required!";
                }
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
                    return "Name must start with capital letter and contain only letters/numbers";
                }
                return null;
            },
        });
        if (!baseName) {
            return;
        }
        // Get version
        const version = await vscode.window.showInputBox({
            prompt: "Enter API version",
            placeHolder: "v1, v2, v3",
            value: "v1",
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return "Version is required!";
                }
                if (!/^v\d+$/.test(value)) {
                    return "Version must be in format: v1, v2, v3, etc.";
                }
                return null;
            },
        });
        if (!version) {
            return;
        }
        // Ask if version should be in URL path
        const includeVersionInPath = await vscode.window.showQuickPick(["Yes", "No"], {
            placeHolder: "Include version in URL path? (/api/v1/users)",
            ignoreFocusOut: true,
        });
        // Ask if version should be in package
        const includeVersionInPackage = await vscode.window.showQuickPick(["Yes", "No"], {
            placeHolder: "Include version in package name? (controller.v1)",
            ignoreFocusOut: true,
        });
        // Ask if CRUD operations should be included
        const includeCrud = await vscode.window.showQuickPick(["No", "Yes"], {
            placeHolder: "Include CRUD operations?",
            ignoreFocusOut: true,
        });
        const config = {
            baseName,
            version,
            includeVersionInPath: includeVersionInPath === "Yes",
            includeVersionInPackage: includeVersionInPackage === "Yes",
            includeCrud: includeCrud === "Yes",
        };
        if (config.includeCrud) {
            config.entityName = await vscode.window.showInputBox({
                prompt: "Enter entity name",
                placeHolder: baseName,
                value: baseName,
                ignoreFocusOut: true,
            });
            config.idType = await vscode.window.showQuickPick(["Long", "Integer", "String", "UUID"], {
                placeHolder: "Select ID data type",
                ignoreFocusOut: true,
            });
        }
        // Generate controller
        const content = generateVersionedControllerContent(config, folderPath);
        // Determine file path
        let targetPath = folderPath;
        if (config.includeVersionInPackage) {
            targetPath = path.join(folderPath, config.version);
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true });
            }
        }
        const fileName = `${baseName}Controller${version.toUpperCase()}.java`;
        const filePath = path.join(targetPath, fileName);
        // Write file
        fs.writeFileSync(filePath, content);
        // Open the file
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
        vscode.window.showInformationMessage(`✅ Versioned controller created: ${fileName}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to create versioned controller: ${error.message}`);
    }
}
exports.createVersionedController = createVersionedController;
function generateVersionedControllerContent(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    const versionSuffix = config.version.toUpperCase();
    const className = `${config.baseName}Controller${versionSuffix}`;
    let finalPackageName = packageName;
    if (config.includeVersionInPackage) {
        finalPackageName = `${packageName}.${config.version}`;
    }
    let content = `package ${finalPackageName};\n\n`;
    // Imports
    content += `import org.springframework.web.bind.annotation.*;\n`;
    if (config.includeCrud) {
        content += `import org.springframework.http.HttpStatus;\n`;
        content += `import org.springframework.http.ResponseEntity;\n`;
        content += `import java.util.List;\n\n`;
    }
    else {
        content += `\n`;
    }
    // JavaDoc
    content += `/**\n`;
    content += ` * ${config.baseName} Controller - API Version ${config.version}\n`;
    content += ` * \n`;
    content += ` * This controller handles ${config.baseName.toLowerCase()} related operations for API ${config.version}\n`;
    content += ` */\n`;
    // Class annotations
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
    // GET all
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
    // GET by ID
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
    // POST create
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
    // PUT update
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
    // DELETE
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