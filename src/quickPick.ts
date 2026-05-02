import * as vscode from "vscode";
import { CATEGORY_ORDER, groupByCategory } from "./commandCatalog";

interface CommandQuickPickItem extends vscode.QuickPickItem {
  commandId?: string;
}

export const openCommandQuickPick = async (): Promise<void> => {
  const grouped = groupByCategory();
  const items: CommandQuickPickItem[] = [];

  for (const category of CATEGORY_ORDER) {
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

  await vscode.commands.executeCommand(
    "spring-code-generator.runWithFolder",
    picked.commandId
  );
};
