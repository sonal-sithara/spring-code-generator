"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const createTemplate = async (folder, type) => {
    let uri = folder;
    if (!folder) {
        await vscode.commands.executeCommand("copyFilePath");
        folder = await vscode.env.clipboard.readText();
        uri = await vscode.Uri.file(folder);
    }
    vscode.window.showInputBox({ placeHolder: "Enter name" }).then((val) => {
        if (undefined !== val && null !== val.trim() && "" !== val.trim()) {
            const wsedit = new vscode.WorkspaceEdit();
            let templateContent = fs
                .readFileSync(__dirname + `/template/${type}.txt`)
                .toString();
            const content = templateContent
                .replace(`temp-mapping`, `${val}`.toLowerCase())
                .replace("TempClassName", `${val}`);
            const filePath = vscode.Uri.file(uri.path + `/${val}.java`);
            wsedit.createFile(filePath, { ignoreIfExists: true });
            wsedit.insert(filePath, new vscode.Position(0, 0), content);
            vscode.workspace.applyEdit(wsedit);
            vscode.window.showInformationMessage(`Created a new file: ${val}`);
        }
        else {
            vscode.window.showWarningMessage("Please enter valid name");
        }
    });
};
exports.createTemplate = createTemplate;
//# sourceMappingURL=main.js.map