"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFile = void 0;
const vscode = require("vscode");
const path = require("path");
const constants_1 = require("../constants");
const fileUtils_1 = require("../utils/fileUtils");
const validation_1 = require("../utils/validation");
/**
 * Main function to create a file based on template type
 * @param folder - The folder URI where file should be created
 * @param type - The template type (e.g., "controller", "entity")
 */
const createFile = async (folder, type) => {
    try {
        const uri = await (0, fileUtils_1.resolveFolderUri)(folder);
        const className = await (0, validation_1.getClassName)();
        if (!(0, validation_1.isValidInput)(className)) {
            (0, validation_1.showWarningMessage)("Please enter a valid class name");
            return;
        }
        const templateValues = await getTemplateValues(type, className);
        await generateFile(uri, type, templateValues);
    }
    catch (error) {
        (0, validation_1.showErrorMessage)(`Error creating file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.createFile = createFile;
/**
 * Gets template-specific values based on template type
 */
const getTemplateValues = async (type, className) => {
    const baseValues = { className, packageName: "" };
    if (type === "repository") {
        const entityName = await (0, validation_1.getEntityName)();
        const dataType = await (0, validation_1.getDataType)();
        if (!(0, validation_1.isValidInput)(entityName) || !(0, validation_1.isValidInput)(dataType)) {
            throw new Error("Entity name and data type are required");
        }
        return { ...baseValues, entityName, dataType };
    }
    else if (type === "service-impl") {
        const interfaceName = await (0, validation_1.getInterfaceName)();
        if (!(0, validation_1.isValidInput)(interfaceName)) {
            throw new Error("Interface name is required");
        }
        return { ...baseValues, interfaceName };
    }
    return baseValues;
};
const getFileExtension = (type) => {
    if (type === "application-properties") {
        return constants_1.PROPERTIES_EXTENSION;
    }
    if (type === "application-yml") {
        return constants_1.YML_EXTENSION;
    }
    return constants_1.JAVA_EXTENSION;
};
/**
 * Generates and creates the file
 */
const generateFile = async (uri, type, values) => {
    const packageName = (0, fileUtils_1.extractPackageName)(uri.path);
    const templateContent = (0, fileUtils_1.readTemplate)(type);
    const fileContent = replaceTemplateVariables(templateContent, {
        ...values,
        packageName,
    });
    const extension = getFileExtension(type);
    const filePath = vscode.Uri.file(path.join(uri.path, `${values.className}${extension}`));
    await (0, fileUtils_1.createFileInWorkspace)(filePath, fileContent);
    (0, validation_1.showInfoMessage)(`✅ Created file: ${values.className}`);
};
/**
 * Replaces template variables with actual values
 */
const replaceTemplateVariables = (content, values) => {
    let result = content;
    result = result.replace(constants_1.PACKAGE_PLACEHOLDER, values.packageName);
    result = result.replace(constants_1.CLASS_NAME_PLACEHOLDER, values.className);
    result = result.replaceAll(constants_1.TEMP_MAPPING_PLACEHOLDER, values.className.toLowerCase());
    if (values.entityName) {
        result = result.replace(constants_1.ENTITY_NAME_PLACEHOLDER, values.entityName);
    }
    if (values.dataType) {
        result = result.replace(constants_1.DATA_TYPE_PLACEHOLDER, values.dataType);
    }
    if (values.interfaceName) {
        result = result.replace(constants_1.INTERFACE_NAME_PLACEHOLDER, values.interfaceName);
    }
    return result;
};
//# sourceMappingURL=fileGenerator.js.map