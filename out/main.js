"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFile = void 0;
const vscode = require("vscode");
const fs = require("fs");
const createFile = async (folder, type) => {
    let uri = folder;
    if (!folder) {
        await vscode.commands.executeCommand("copyFilePath");
        folder = await vscode.env.clipboard.readText();
        uri = await vscode.Uri.file(folder);
    }
    vscode.window.showInputBox({ placeHolder: "Enter name" }).then(async (val) => {
        if (undefined !== val && null !== val.trim() && "" !== val.trim()) {
            if (type === "repository") {
                let repositoryValues = await getRepositoryValues();
                console.log(repositoryValues);
                createTemplate(val, type, uri, repositoryValues.entityName, repositoryValues.dataType);
            }
            else {
                createTemplate(val, type, uri, "", "");
            }
        }
        else {
            vscode.window.showWarningMessage("Please enter valid name");
        }
    });
};
exports.createFile = createFile;
const createTemplate = (val, type, uri, entityName, dataType) => {
    const wsedit = new vscode.WorkspaceEdit();
    let templateContent = fs
        .readFileSync(__dirname + `/template/${type}.txt`)
        .toString();
    const content = templateContent
        .replace(`temp-mapping`, `${val}`.toLowerCase())
        .replace("TempClassName", `${val}`)
        .replace("entityName", entityName)
        .replace("dataType", dataType);
    const filePath = vscode.Uri.file(uri.path + `/${val}.java`);
    wsedit.createFile(filePath, { ignoreIfExists: true });
    wsedit.insert(filePath, new vscode.Position(0, 0), content);
    vscode.workspace.applyEdit(wsedit);
    vscode.window.showInformationMessage(`Created a new file: ${val}`);
};
const getRepositoryValues = async () => {
    let values = { entityName: "", dataType: "" };
    await vscode.window
        .showInputBox({ placeHolder: "Enter Entity Name" })
        .then(async (entityName) => {
        if (undefined !== entityName &&
            null !== entityName.trim() &&
            "" !== entityName.trim()) {
            await vscode.window
                .showInputBox({ placeHolder: "Enter ID Data Type [ex -> Integer]" })
                .then((dataType) => {
                if (undefined !== dataType &&
                    null !== dataType.trim() &&
                    "" !== dataType.trim()) {
                    values.entityName = entityName;
                    values.dataType = dataType;
                }
                else {
                    vscode.window.showWarningMessage("Please enter valid type");
                }
            });
        }
        else {
            vscode.window.showWarningMessage("Please enter valid name");
        }
    });
    return values;
};
//# sourceMappingURL=main.js.map