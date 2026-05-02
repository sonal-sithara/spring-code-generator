import * as vscode from "vscode";
import {
  CATEGORY_ORDER,
  CatalogEntry,
  CommandCategory,
  groupByCategory,
} from "../commandCatalog";

type Node = CategoryNode | CommandNode;

interface CategoryNode {
  kind: "category";
  category: CommandCategory;
}

interface CommandNode {
  kind: "command";
  entry: CatalogEntry;
}

export class CommandsTreeProvider implements vscode.TreeDataProvider<Node> {
  private readonly grouped = groupByCategory();

  getTreeItem(node: Node): vscode.TreeItem {
    if (node.kind === "category") {
      const item = new vscode.TreeItem(
        node.category,
        vscode.TreeItemCollapsibleState.Expanded
      );
      item.iconPath = new vscode.ThemeIcon("folder");
      item.contextValue = "category";
      return item;
    }

    const item = new vscode.TreeItem(
      node.entry.title,
      vscode.TreeItemCollapsibleState.None
    );
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

  getChildren(node?: Node): Node[] {
    if (!node) {
      return CATEGORY_ORDER
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
