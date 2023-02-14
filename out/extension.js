"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const main_1 = require("./main");
function activate(context) {
    console.log("Spring Code Generator Activated");
    let createControllerDisposable = vscode.commands.registerCommand("spring-code-generator.createController", async (folder) => {
        await (0, main_1.createFile)(folder, "controller");
    });
    let createControllerWithCrudDisposable = vscode.commands.registerCommand("spring-code-generator.createControllerWithCrud", async (folder) => {
        await (0, main_1.createFile)(folder, "controller-with-crud");
    });
    let createService = vscode.commands.registerCommand("spring-code-generator.createService", async (folder) => {
        await (0, main_1.createFile)(folder, "service");
    });
    let createEntity = vscode.commands.registerCommand("spring-code-generator.createEntity", async (folder) => {
        await (0, main_1.createFile)(folder, "entity");
    });
    let createEntityWithLombok = vscode.commands.registerCommand("spring-code-generator.createEntityWithLombok", async (folder) => {
        await (0, main_1.createFile)(folder, "entity-with-lombok");
    });
    let createDto = vscode.commands.registerCommand("spring-code-generator.createDto", async (folder) => {
        await (0, main_1.createFile)(folder, "dto");
    });
    let createDtoWithLombok = vscode.commands.registerCommand("spring-code-generator.createDtoWithLombok", async (folder) => {
        await (0, main_1.createFile)(folder, "dto-with-lombok");
    });
    let createRepository = vscode.commands.registerCommand("spring-code-generator.createRepository", async (folder) => {
        await (0, main_1.createFile)(folder, "repository");
    });
    context.subscriptions.push(createControllerDisposable);
    context.subscriptions.push(createControllerWithCrudDisposable);
    context.subscriptions.push(createService);
    context.subscriptions.push(createEntity);
    context.subscriptions.push(createEntityWithLombok);
    context.subscriptions.push(createDto);
    context.subscriptions.push(createDtoWithLombok);
    context.subscriptions.push(createRepository);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map