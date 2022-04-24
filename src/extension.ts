import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.log("Spring Code Generator Activated");

  let createControllerDisposable = vscode.commands.registerCommand(
    "spring-code-generator.createController",
    (uri: vscode.Uri) => {
      vscode.window
        .showInputBox({ placeHolder: "Enter name" })
        .then(async (val) => {
          if (undefined !== val && null !== val.trim() && "" !== val.trim()) {
            const wsedit = new vscode.WorkspaceEdit();
            let controllerContent = fs
              .readFileSync(__dirname + "/template/controller.txt")
              .toString();
            const content = controllerContent
              .replace(`test-mapping`, `${val}`.toLowerCase())
              .replace("TestController", `${val}`);
            const filePath = vscode.Uri.file(uri.path + `/${val}.java`);
            wsedit.createFile(filePath, { ignoreIfExists: true });
            wsedit.insert(filePath, new vscode.Position(0, 0), content);

            vscode.workspace.applyEdit(wsedit);
            vscode.window.showInformationMessage(`Created a new file: ${val}`);
          } else {
            vscode.window.showWarningMessage("Please enter valid name");
          }
        });
    }
  );

  context.subscriptions.push(createControllerDisposable);
}

export function deactivate() {}
