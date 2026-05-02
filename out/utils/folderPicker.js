"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickTargetFolder = void 0;
const vscode = require("vscode");
/**
 * Prompts the user for a target folder when one isn't supplied via the
 * right-click context menu. Returns undefined if the user cancels or if
 * no workspace is open.
 */
const pickTargetFolder = async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showInformationMessage("Open a folder or workspace to use Spring Code Generator.");
        return undefined;
    }
    let defaultUri;
    if (workspaceFolders.length > 1) {
        const picked = await vscode.window.showWorkspaceFolderPick({
            placeHolder: "Pick a workspace folder",
        });
        if (!picked) {
            return undefined;
        }
        defaultUri = picked.uri;
    }
    else {
        defaultUri = workspaceFolders[0].uri;
    }
    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (activeUri && activeUri.scheme === "file") {
        defaultUri = vscode.Uri.joinPath(activeUri, "..");
    }
    const selected = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select target folder",
        defaultUri,
    });
    return selected && selected.length > 0 ? selected[0] : undefined;
};
exports.pickTargetFolder = pickTargetFolder;
//# sourceMappingURL=folderPicker.js.map