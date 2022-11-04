import * as vscode from "vscode";
import { createFile } from "./main";

export function activate(context: vscode.ExtensionContext) {
  console.log("Spring Code Generator Activated");

  let createControllerDisposable = vscode.commands.registerCommand(
    "spring-code-generator.createController",
    async (folder) => {
      await createFile(folder, "controller");
    }
  );

  let createControllerWithCrudDisposable = vscode.commands.registerCommand(
    "spring-code-generator.createControllerWithCrud",
    async (folder) => {
      await createFile(folder, "controller-with-crud");
    }
  );

  let createService = vscode.commands.registerCommand(
    "spring-code-generator.createService",
    async (folder) => {
      await createFile(folder, "service");
    }
  );

  let createEntity = vscode.commands.registerCommand(
    "spring-code-generator.createEntity",
    async (folder) => {
      await createFile(folder, "entity");
    }
  );

  let createDto = vscode.commands.registerCommand(
    "spring-code-generator.createDto",
    async (folder) => {
      await createFile(folder, "dto");
    }
  );

  let createRepository = vscode.commands.registerCommand(
    "spring-code-generator.createRepository",
    async (folder) => {
      await createFile(folder, "repository");
    }
  );

  context.subscriptions.push(createControllerDisposable);
  context.subscriptions.push(createControllerWithCrudDisposable);
  context.subscriptions.push(createService);
  context.subscriptions.push(createEntity);
  context.subscriptions.push(createDto);
  context.subscriptions.push(createRepository);
}

export function deactivate() {}
