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
export const getClassName = async (placeholder: string = "Enter class name"): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: placeholder,
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

/**
 * Gets relationship type from user
 */
export const getRelationshipType = async (): Promise<string> => {
  const result = await vscode.window.showQuickPick(
    ["OneToMany", "ManyToOne", "ManyToMany"],
    {
      placeHolder: "Select relationship type",
    }
  );
  return result || "";
};

/**
 * Gets relationship field name input from user
 */
export const getRelationshipName = async (placeholder: string = "Relationship field name"): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: placeholder,
    validateInput: (value) =>
      !isValidInput(value) ? "Relationship name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Gets target entity name input from user
 */
export const getTargetEntityName = async (placeholder: string = "Target entity name"): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: placeholder,
    validateInput: (value) =>
      !isValidInput(value) ? "Target entity name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Gets bidirectional option from user
 */
export const getBidirectionalOption = async (): Promise<boolean> => {
  const result = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Is this a bidirectional relationship?",
  });
  return result === "Yes";
};

/**
 * Gets cascade options from user
 */
export const getCascadeOptions = async (): Promise<string[]> => {
  const result = await vscode.window.showQuickPick(
    [
      { label: "PERSIST", picked: true, description: "Persist cascading" },
      { label: "REMOVE", picked: false, description: "Remove cascading" },
      { label: "MERGE", picked: false, description: "Merge cascading" },
      { label: "DETACH", picked: false, description: "Detach cascading" },
      { label: "REFRESH", picked: false, description: "Refresh cascading" },
    ],
    {
      canPickMany: true,
      placeHolder: "Select cascade options (use arrow keys and space to select)",
    }
  );
  return result?.map((item: any) => item.label) || [];
};

/**
 * Gets configuration types from user
 */
export const getConfigurationTypes = async (): Promise<Array<{ label: string }> | null> => {
  const result = await vscode.window.showQuickPick(
    [
      { label: "Database", picked: true, description: "JPA & Hibernate configuration" },
      { label: "Security", picked: false, description: "Spring Security configuration" },
      { label: "JWT", picked: false, description: "JWT authentication configuration" },
      { label: "CORS", picked: false, description: "CORS (Cross-Origin Resource Sharing)" },
    ],
    {
      canPickMany: true,
      placeHolder: "Select configuration templates to generate",
    }
  );
  return result as Array<{ label: string }> | null;
};
