import * as vscode from "vscode";

/**
 * Validates if input is not empty or null
 */
export const isValidInput = (input: string | undefined): boolean => {
  return input !== undefined && input !== null && input.trim().length > 0;
};

/**
 * Gets class name input from user
 */
export const getClassName = async (): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: "Enter class name",
    validateInput: (value) =>
      !isValidInput(value) ? "Class name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Gets module name input from user
 */
export const getModuleName = async (): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: "Enter module name (e.g., User, Product, Order)",
    validateInput: (value) =>
      !isValidInput(value) ? "Module name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Gets project name input from user
 */
export const getProjectName = async (): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: "Enter project name (e.g., MySpringApp)",
    validateInput: (value) =>
      !isValidInput(value) ? "Project name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Gets data type input from user
 */
export const getDataType = async (defaultValue: string = "Long"): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: "Enter data type (e.g., Long, Integer, String)",
    value: defaultValue,
    validateInput: (value) =>
      !isValidInput(value) ? "Data type cannot be empty" : "",
  });
  return input || defaultValue;
};

/**
 * Gets entity name input from user
 */
export const getEntityName = async (): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: "Enter entity name",
    validateInput: (value) =>
      !isValidInput(value) ? "Entity name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Gets interface name input from user
 */
export const getInterfaceName = async (): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: "Enter interface name (e.g., UserService)",
    validateInput: (value) =>
      !isValidInput(value) ? "Interface name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Shows multi-select quick pick
 */
export const showQuickPick = async (
  items: Array<{ label: string; picked?: boolean; description?: string }>,
  placeholder: string,
  canPickMany: boolean = false
): Promise<Array<{ label: string }> | null> => {
  const result = await vscode.window.showQuickPick(items, {
    canPickMany,
    placeHolder: placeholder,
  } as any);
  return result as Array<{ label: string }> | null;
};

/**
 * Shows confirmation message
 */
export const showInfoMessage = (message: string): void => {
  vscode.window.showInformationMessage(message);
};

/**
 * Shows error message
 */
export const showErrorMessage = (message: string): void => {
  vscode.window.showErrorMessage(message);
};

/**
 * Shows warning message
 */
export const showWarningMessage = (message: string): void => {
  vscode.window.showWarningMessage(message);
};
