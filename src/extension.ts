import * as vscode from "vscode";
import { createTemplate } from "./main";

export function activate(context: vscode.ExtensionContext) {
  console.log("Spring Code Generator Activated");

  let createControllerDisposable = vscode.commands.registerCommand(
    "spring-code-generator.createController",
    async (folder) => {
      await createTemplate(folder, "controller");
    }
  );

  let createControllerWithCrudDisposable = vscode.commands.registerCommand(
    "spring-code-generator.createControllerWithCrud",
    async (folder) => {
      await createTemplate(folder, "controller-with-crud");
    }
  );

  let createService = vscode.commands.registerCommand(
    "spring-code-generator.createService",
    async (folder) => {
      await createTemplate(folder, "service");
    }
  );

  let createEntity = vscode.commands.registerCommand(
    "spring-code-generator.createEntity",
    async (folder) => {
      await createTemplate(folder, "entity");
    }
  );

  let createDto = vscode.commands.registerCommand(
    "spring-code-generator.createDto",
    async (folder) => {
      await createTemplate(folder, "dto");
    }
  );

  context.subscriptions.push(createControllerDisposable);
  context.subscriptions.push(createControllerWithCrudDisposable);
  context.subscriptions.push(createService);
  context.subscriptions.push(createEntity);
  context.subscriptions.push(createDto);
}

export function deactivate() {}
