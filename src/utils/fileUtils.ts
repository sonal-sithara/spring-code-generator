import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  JAVA_PACKAGE_SEPARATOR,
  TEMPLATE_EXTENSION,
} from "../constants";

/**
 * Resolves the folder URI, using clipboard if not provided
 */
export const resolveFolderUri = async (folder: any): Promise<vscode.Uri> => {
  if (folder) {
    return folder;
  }

  await vscode.commands.executeCommand("copyFilePath");
  const folderPath = await vscode.env.clipboard.readText();
  return vscode.Uri.file(folderPath);
};

/**
 * Extracts package name from file path
 */
export const extractPackageName = (folderPath: string): string => {
  const parts = folderPath.split(JAVA_PACKAGE_SEPARATOR);
  if (parts.length <= 1) {
    return "";
  }
  return parts[1].replaceAll("/", ".");
};

/**
 * Reads template file content
 */
export const readTemplate = (type: string): string => {
  const templatePath = path.join(
    __dirname,
    "../../../out/template",
    `${type}${TEMPLATE_EXTENSION}`
  );
  return fs.readFileSync(templatePath, "utf-8");
};

/**
 * Creates a file in the workspace
 */
export const createFileInWorkspace = async (
  filePath: vscode.Uri,
  content: string
): Promise<void> => {
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.createFile(filePath, { ignoreIfExists: true });
  workspaceEdit.insert(filePath, new vscode.Position(0, 0), content);
  await vscode.workspace.applyEdit(workspaceEdit);
};

/**
 * Creates multiple files at once
 */
export const createFilesInWorkspace = async (
  files: Array<{ path: vscode.Uri; content: string }>
): Promise<void> => {
  const workspaceEdit = new vscode.WorkspaceEdit();
  files.forEach((file) => {
    workspaceEdit.createFile(file.path, { ignoreIfExists: true });
    workspaceEdit.insert(file.path, new vscode.Position(0, 0), file.content);
  });
  await vscode.workspace.applyEdit(workspaceEdit);
};

/**
 * Creates a directory in the workspace
 */
export const createFolderInWorkspace = async (
  folderUri: vscode.Uri
): Promise<void> => {
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.createFile(folderUri, { ignoreIfExists: true });
  await vscode.workspace.applyEdit(workspaceEdit);
};
