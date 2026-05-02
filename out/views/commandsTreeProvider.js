"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsTreeProvider = void 0;
const vscode = require("vscode");
const commandCatalog_1 = require("../commandCatalog");
class CommandsTreeProvider {
    constructor() {
        this.grouped = (0, commandCatalog_1.groupByCategory)();
    }
    getTreeItem(node) {
        if (node.kind === "category") {
            const item = new vscode.TreeItem(node.category, vscode.TreeItemCollapsibleState.Expanded);
            item.iconPath = new vscode.ThemeIcon("folder");
            item.contextValue = "category";
            return item;
        }
        const item = new vscode.TreeItem(node.entry.title, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon("symbol-method");
        item.tooltip = node.entry.id;
        item.contextValue = "command";
        item.command = {
            command: "spring-code-generator.runWithFolder",
            title: node.entry.title,
            arguments: [node.entry.id],
        };
        return item;
    }
    getChildren(node) {
        if (!node) {
            return commandCatalog_1.CATEGORY_ORDER
                .filter((category) => (this.grouped.get(category) ?? []).length > 0)
                .map((category) => ({ kind: "category", category }));
        }
        if (node.kind === "category") {
            const entries = this.grouped.get(node.category) ?? [];
            return entries.map((entry) => ({ kind: "command", entry }));
        }
        return [];
    }
}
exports.CommandsTreeProvider = CommandsTreeProvider;
//# sourceMappingURL=commandsTreeProvider.js.map