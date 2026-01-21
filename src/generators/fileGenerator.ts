import * as vscode from "vscode";
import * as path from "path";
import {
  PACKAGE_PLACEHOLDER,
  CLASS_NAME_PLACEHOLDER,
  TEMP_MAPPING_PLACEHOLDER,
  INTERFACE_NAME_PLACEHOLDER,
  ENTITY_NAME_PLACEHOLDER,
  DATA_TYPE_PLACEHOLDER,
  JAVA_EXTENSION,
  PROPERTIES_EXTENSION,
  YML_EXTENSION,
} from "../constants";
import { TemplateValues } from "../types";
import {
  resolveFolderUri,
  extractPackageName,
  readTemplate,
  createFileInWorkspace,
} from "../utils/fileUtils";
import {
  isValidInput,
  getClassName,
  getDataType,
  getEntityName,
  getInterfaceName,
  showInfoMessage,
  showErrorMessage,
  showWarningMessage,
} from "../utils/validation";

/**
 * Main function to create a file based on template type
 * @param folder - The folder URI where file should be created
 * @param type - The template type (e.g., "controller", "entity")
 */
export const createFile = async (folder: any, type: string): Promise<void> => {
  try {
    const uri = await resolveFolderUri(folder);
    const className = await getClassName();

    if (!isValidInput(className)) {
      showWarningMessage("Please enter a valid class name");
      return;
    }

    const templateValues = await getTemplateValues(type, className);
    await generateFile(uri, type, templateValues);
  } catch (error) {
    showErrorMessage(
      `Error creating file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Gets template-specific values based on template type
 */
const getTemplateValues = async (
  type: string,
  className: string
): Promise<TemplateValues> => {
  const baseValues: TemplateValues = { className, packageName: "" };

  if (type === "repository") {
    const entityName = await getEntityName();
    const dataType = await getDataType();
    if (!isValidInput(entityName) || !isValidInput(dataType)) {
      throw new Error("Entity name and data type are required");
    }
    return { ...baseValues, entityName, dataType };
  } else if (type === "service-impl") {
    const interfaceName = await getInterfaceName();
    if (!isValidInput(interfaceName)) {
      throw new Error("Interface name is required");
    }
    return { ...baseValues, interfaceName };
  }

  return baseValues;
};

const getFileExtension = (type: string): string => {
  if (type === "application-properties") {
    return PROPERTIES_EXTENSION;
  }
  if (type === "application-yml") {
    return YML_EXTENSION;
  }
  return JAVA_EXTENSION;
};

/**
 * Generates and creates the file
 */
const generateFile = async (
  uri: vscode.Uri,
  type: string,
  values: TemplateValues
): Promise<void> => {
  const packageName = extractPackageName(uri.path);
  const templateContent = readTemplate(type);
  const fileContent = replaceTemplateVariables(templateContent, {
    ...values,
    packageName,
  });

  const extension = getFileExtension(type);
  const filePath = vscode.Uri.file(
    path.join(uri.path, `${values.className}${extension}`)
  );

  await createFileInWorkspace(filePath, fileContent);
  showInfoMessage(`✅ Created file: ${values.className}`);
};

/**
 * Replaces template variables with actual values
 */
const replaceTemplateVariables = (
  content: string,
  values: TemplateValues
): string => {
  let result = content;

  result = result.replace(PACKAGE_PLACEHOLDER, values.packageName);
  result = result.replace(CLASS_NAME_PLACEHOLDER, values.className);
  result = result.replaceAll(
    TEMP_MAPPING_PLACEHOLDER,
    values.className.toLowerCase()
  );

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
