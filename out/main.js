"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFile = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
// Constants
const JAVA_PACKAGE_SEPARATOR = "java/";
const PACKAGE_PLACEHOLDER = "package-des";
const CLASS_NAME_PLACEHOLDER = "TempClassName";
const TEMP_MAPPING_PLACEHOLDER = "temp-mapping";
const INTERFACE_NAME_PLACEHOLDER = "interfaceName";
const ENTITY_NAME_PLACEHOLDER = "entityName";
const DATA_TYPE_PLACEHOLDER = "dataType";
const TEMPLATE_EXTENSION = ".txt";
const JAVA_EXTENSION = ".java";
/**
 * Main function to create a file based on template type
 * @param folder - The folder URI where file should be created
 * @param type - The template type (e.g., "controller", "entity")
 */
const createFile = async (folder, type) => {
    try {
        const uri = await resolveFolderUri(folder);
        const className = await getClassName();
        if (!isValidInput(className)) {
            vscode.window.showWarningMessage("Please enter a valid class name");
            return;
        }
        const templateValues = await getTemplateValues(type, className);
        await generateFile(uri, type, templateValues);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error creating file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.createFile = createFile;
/**
 * Resolves the folder URI, using clipboard if not provided
 */
const resolveFolderUri = async (folder) => {
    if (folder) {
        return folder;
    }
    await vscode.commands.executeCommand("copyFilePath");
    const folderPath = await vscode.env.clipboard.readText();
    return vscode.Uri.file(folderPath);
};
/**
 * Gets class name input from user
 */
const getClassName = async () => {
    const input = await vscode.window.showInputBox({
        placeHolder: "Enter class name",
        validateInput: (value) => !isValidInput(value) ? "Class name cannot be empty" : "",
    });
    return input || "";
};
/**
 * Validates if input is not empty or null
 */
const isValidInput = (input) => {
    return input !== undefined && input !== null && input.trim().length > 0;
};
/**
 * Gets template-specific values based on template type
 */
const getTemplateValues = async (type, className) => {
    const baseValues = { className, packageName: "" };
    if (type === "repository") {
        const repoValues = await getRepositoryValues();
        return { ...baseValues, ...repoValues };
    }
    else if (type === "service-impl") {
        const serviceValues = await getServiceImplValues();
        return { ...baseValues, ...serviceValues };
    }
    return baseValues;
};
/**
 * Generates and creates the Java file
 */
const generateFile = async (uri, type, values) => {
    const packageName = extractPackageName(uri.path);
    const templateContent = readTemplate(type);
    const fileContent = replaceTemplateVariables(templateContent, {
        ...values,
        packageName,
    });
    const filePath = vscode.Uri.file(path.join(uri.path, `${values.className}${JAVA_EXTENSION}`));
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.createFile(filePath, { ignoreIfExists: true });
    workspaceEdit.insert(filePath, new vscode.Position(0, 0), fileContent);
    await vscode.workspace.applyEdit(workspaceEdit);
    vscode.window.showInformationMessage(`Created file: ${values.className}`);
};
/**
 * Extracts package name from file path
 */
const extractPackageName = (folderPath) => {
    const parts = folderPath.split(JAVA_PACKAGE_SEPARATOR);
    if (parts.length <= 1) {
        return "";
    }
    return parts[1].replaceAll("/", ".");
};
/**
 * Reads template file content
 */
const readTemplate = (type) => {
    const templatePath = path.join(__dirname, "template", `${type}${TEMPLATE_EXTENSION}`);
    return fs.readFileSync(templatePath, "utf-8");
};
/**
 * Replaces template variables with actual values
 */
const replaceTemplateVariables = (content, values) => {
    let result = content;
    result = result.replace(PACKAGE_PLACEHOLDER, values.packageName);
    result = result.replace(CLASS_NAME_PLACEHOLDER, values.className);
    result = result.replaceAll(TEMP_MAPPING_PLACEHOLDER, values.className.toLowerCase());
    if (values.entityName) {
        result = result.replace(ENTITY_NAME_PLACEHOLDER, values.entityName);
    }
    if (values.dataType) {
        result = result.replace(DATA_TYPE_PLACEHOLDER, values.dataType);
    }
    if (values.interfaceName) {
        result = result.replace(INTERFACE_NAME_PLACEHOLDER, values.interfaceName);
    }
    return result;
};
/**
 * Gets repository-specific values (entity name and data type)
 */
const getRepositoryValues = async () => {
    const entityName = await vscode.window.showInputBox({
        placeHolder: "Enter entity name",
        validateInput: (value) => !isValidInput(value) ? "Entity name cannot be empty" : "",
    });
    if (!isValidInput(entityName)) {
        throw new Error("Entity name is required");
    }
    const dataType = await vscode.window.showInputBox({
        placeHolder: "Enter ID data type (e.g., Integer, Long)",
        validateInput: (value) => !isValidInput(value) ? "Data type cannot be empty" : "",
    });
    if (!isValidInput(dataType)) {
        throw new Error("Data type is required");
    }
    return { entityName: entityName, dataType: dataType };
};
/**
 * Gets service implementation-specific values (interface name)
 */
const getServiceImplValues = async () => {
    const interfaceName = await vscode.window.showInputBox({
        placeHolder: "Enter interface name (e.g., UserService)",
        validateInput: (value) => !isValidInput(value) ? "Interface name cannot be empty" : "",
    });
    if (!isValidInput(interfaceName)) {
        throw new Error("Interface name is required");
    }
    return { interfaceName: interfaceName };
};
//# sourceMappingURL=main.js.map