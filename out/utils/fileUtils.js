"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolderInWorkspace = exports.createFilesInWorkspace = exports.createFileInWorkspace = exports.readTemplate = exports.extractPackageName = exports.resolveFolderUri = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const constants_1 = require("../constants");
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
exports.resolveFolderUri = resolveFolderUri;
/**
 * Extracts package name from file path
 */
const extractPackageName = (folderPath) => {
    const parts = folderPath.split(constants_1.JAVA_PACKAGE_SEPARATOR);
    if (parts.length <= 1) {
        return "";
    }
    return parts[1].replaceAll("/", ".");
};
exports.extractPackageName = extractPackageName;
/**
 * Reads template file content
 */
const readTemplate = (type) => {
    const templatePath = path.join(__dirname, "../template", `${type}${constants_1.TEMPLATE_EXTENSION}`);
    return fs.readFileSync(templatePath, "utf-8");
};
exports.readTemplate = readTemplate;
/**
 * Creates a file in the workspace
 */
const createFileInWorkspace = async (filePath, content) => {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.createFile(filePath, { ignoreIfExists: true });
    workspaceEdit.insert(filePath, new vscode.Position(0, 0), content);
    await vscode.workspace.applyEdit(workspaceEdit);
};
exports.createFileInWorkspace = createFileInWorkspace;
/**
 * Creates multiple files at once
 */
const createFilesInWorkspace = async (files) => {
    const workspaceEdit = new vscode.WorkspaceEdit();
    files.forEach((file) => {
        workspaceEdit.createFile(file.path, { ignoreIfExists: true });
        workspaceEdit.insert(file.path, new vscode.Position(0, 0), file.content);
    });
    await vscode.workspace.applyEdit(workspaceEdit);
};
exports.createFilesInWorkspace = createFilesInWorkspace;
/**
 * Creates a directory in the workspace
 */
const createFolderInWorkspace = async (folderUri) => {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.createFile(folderUri, { ignoreIfExists: true });
    await vscode.workspace.applyEdit(workspaceEdit);
};
exports.createFolderInWorkspace = createFolderInWorkspace;
//# sourceMappingURL=fileUtils.js.map