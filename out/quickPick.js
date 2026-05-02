"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openCommandQuickPick = void 0;
const vscode = require("vscode");
const commandCatalog_1 = require("./commandCatalog");
const openCommandQuickPick = async () => {
    const grouped = (0, commandCatalog_1.groupByCategory)();
    const items = [];
    for (const category of commandCatalog_1.CATEGORY_ORDER) {
        const entries = grouped.get(category) ?? [];
        if (entries.length === 0) {
            continue;
        }
        items.push({ label: category, kind: vscode.QuickPickItemKind.Separator });
        for (const entry of entries) {
            items.push({
                label: entry.title,
                description: category,
                commandId: entry.id,
            });
        }
    }
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: "Spring: pick a generator",
        matchOnDescription: true,
    });
    if (!picked || !picked.commandId) {
        return;
    }
    await vscode.commands.executeCommand("spring-code-generator.runWithFolder", picked.commandId);
};
exports.openCommandQuickPick = openCommandQuickPick;
//# sourceMappingURL=quickPick.js.map