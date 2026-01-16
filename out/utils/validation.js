"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showYesNoChoice = exports.getConfigurationTypes = exports.getCascadeOptions = exports.getBidirectionalOption = exports.getTargetEntityName = exports.getRelationshipName = exports.getRelationshipType = exports.showWarningMessage = exports.showErrorMessage = exports.showInfoMessage = exports.showQuickPick = exports.getInterfaceName = exports.getEntityName = exports.getDataType = exports.getProjectName = exports.getModuleName = exports.getClassName = exports.isValidInput = void 0;
const vscode = require("vscode");
/**
 * Validates if input is not empty or null
 */
const isValidInput = (input) => {
    return input !== undefined && input !== null && input.trim().length > 0;
};
exports.isValidInput = isValidInput;
/**
 * Gets class name input from user
 */
const getClassName = async (placeholder = "Enter class name") => {
    const input = await vscode.window.showInputBox({
        placeHolder: placeholder,
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Class name cannot be empty" : "",
    });
    return input || "";
};
exports.getClassName = getClassName;
/**
 * Gets module name input from user
 */
const getModuleName = async () => {
    const input = await vscode.window.showInputBox({
        placeHolder: "Enter module name (e.g., User, Product, Order)",
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Module name cannot be empty" : "",
    });
    return input || "";
};
exports.getModuleName = getModuleName;
/**
 * Gets project name input from user
 */
const getProjectName = async () => {
    const input = await vscode.window.showInputBox({
        placeHolder: "Enter project name (e.g., MySpringApp)",
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Project name cannot be empty" : "",
    });
    return input || "";
};
exports.getProjectName = getProjectName;
/**
 * Gets data type input from user
 */
const getDataType = async (defaultValue = "Long") => {
    const input = await vscode.window.showInputBox({
        placeHolder: "Enter data type (e.g., Long, Integer, String)",
        value: defaultValue,
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Data type cannot be empty" : "",
    });
    return input || defaultValue;
};
exports.getDataType = getDataType;
/**
 * Gets entity name input from user
 */
const getEntityName = async () => {
    const input = await vscode.window.showInputBox({
        placeHolder: "Enter entity name",
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Entity name cannot be empty" : "",
    });
    return input || "";
};
exports.getEntityName = getEntityName;
/**
 * Gets interface name input from user
 */
const getInterfaceName = async () => {
    const input = await vscode.window.showInputBox({
        placeHolder: "Enter interface name (e.g., UserService)",
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Interface name cannot be empty" : "",
    });
    return input || "";
};
exports.getInterfaceName = getInterfaceName;
/**
 * Shows multi-select quick pick
 */
const showQuickPick = async (items, placeholder, canPickMany = false) => {
    const result = await vscode.window.showQuickPick(items, {
        canPickMany,
        placeHolder: placeholder,
    });
    return result;
};
exports.showQuickPick = showQuickPick;
/**
 * Shows confirmation message
 */
const showInfoMessage = (message) => {
    vscode.window.showInformationMessage(message);
};
exports.showInfoMessage = showInfoMessage;
/**
 * Shows error message
 */
const showErrorMessage = (message) => {
    vscode.window.showErrorMessage(message);
};
exports.showErrorMessage = showErrorMessage;
/**
 * Shows warning message
 */
const showWarningMessage = (message) => {
    vscode.window.showWarningMessage(message);
};
exports.showWarningMessage = showWarningMessage;
/**
 * Gets relationship type from user
 */
const getRelationshipType = async () => {
    const result = await vscode.window.showQuickPick(["OneToMany", "ManyToOne", "ManyToMany"], {
        placeHolder: "Select relationship type",
    });
    return result || "";
};
exports.getRelationshipType = getRelationshipType;
/**
 * Gets relationship field name input from user
 */
const getRelationshipName = async (placeholder = "Relationship field name") => {
    const input = await vscode.window.showInputBox({
        placeHolder: placeholder,
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Relationship name cannot be empty" : "",
    });
    return input || "";
};
exports.getRelationshipName = getRelationshipName;
/**
 * Gets target entity name input from user
 */
const getTargetEntityName = async (placeholder = "Target entity name") => {
    const input = await vscode.window.showInputBox({
        placeHolder: placeholder,
        validateInput: (value) => !(0, exports.isValidInput)(value) ? "Target entity name cannot be empty" : "",
    });
    return input || "";
};
exports.getTargetEntityName = getTargetEntityName;
/**
 * Gets bidirectional option from user
 */
const getBidirectionalOption = async () => {
    const result = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Is this a bidirectional relationship?",
    });
    return result === "Yes";
};
exports.getBidirectionalOption = getBidirectionalOption;
/**
 * Gets cascade options from user
 */
const getCascadeOptions = async () => {
    const result = await vscode.window.showQuickPick([
        { label: "PERSIST", picked: true, description: "Persist cascading" },
        { label: "REMOVE", picked: false, description: "Remove cascading" },
        { label: "MERGE", picked: false, description: "Merge cascading" },
        { label: "DETACH", picked: false, description: "Detach cascading" },
        { label: "REFRESH", picked: false, description: "Refresh cascading" },
    ], {
        canPickMany: true,
        placeHolder: "Select cascade options (use arrow keys and space to select)",
    });
    return result?.map((item) => item.label) || [];
};
exports.getCascadeOptions = getCascadeOptions;
/**
 * Gets configuration types from user
 */
const getConfigurationTypes = async () => {
    const result = await vscode.window.showQuickPick([
        { label: "Database", picked: true, description: "JPA & Hibernate configuration" },
        { label: "Security", picked: false, description: "Spring Security configuration" },
        { label: "JWT", picked: false, description: "JWT authentication configuration" },
        { label: "CORS", picked: false, description: "CORS (Cross-Origin Resource Sharing)" },
    ], {
        canPickMany: true,
        placeHolder: "Select configuration templates to generate",
    });
    return result;
};
exports.getConfigurationTypes = getConfigurationTypes;
/**
 * Gets yes/no choice from user
 */
const showYesNoChoice = async (question) => {
    const result = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: question,
    });
    return result === "Yes";
};
exports.showYesNoChoice = showYesNoChoice;
//# sourceMappingURL=validation.js.map