import * as vscode from "vscode";
import { showWarningMessage } from "../utils/validation";

/**
 * File Organization Helper - Organize Spring Boot project files into proper folder structure
 * Automatically detects files and moves them to appropriate folders based on naming conventions
 */
export async function organizeProjectFiles(): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const srcPath = vscode.Uri.joinPath(workspaceFolder.uri, "src", "main", "java");

    // Get all Java files in src/main/java
    const files = await vscode.workspace.fs.readDirectory(srcPath);
    const javaFiles = files.filter(([name, type]) => 
      type === vscode.FileType.File && name.endsWith(".java")
    );

    if (javaFiles.length === 0) {
      vscode.window.showWarningMessage("No Java files found to organize");
      return;
    }

    let organizedCount = 0;
    let skippedCount = 0;

    for (const [fileName] of javaFiles) {
      const result = await organizeFile(workspaceFolder, srcPath, fileName);
      if (result) {
        organizedCount++;
      } else {
        skippedCount++;
      }
    }

    const message = `✓ Organization complete! Organized: ${organizedCount}, Skipped: ${skippedCount}`;
    vscode.window.showInformationMessage(message);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error organizing files: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Organize a single file based on naming conventions
 */
async function organizeFile(
  workspaceFolder: vscode.WorkspaceFolder,
  srcPath: vscode.Uri,
  fileName: string
): Promise<boolean> {
  try {
    const folder = determineFolderFromFileName(fileName);
    
    // If no folder is determined, skip the file
    if (!folder) {
      return false;
    }

    const sourceUri = vscode.Uri.joinPath(srcPath, fileName);
    const targetFolder = vscode.Uri.joinPath(srcPath, folder);
    const targetUri = vscode.Uri.joinPath(targetFolder, fileName);

    // Check if file is already in correct folder
    if (sourceUri.fsPath === targetUri.fsPath) {
      return false;
    }

    // Create target folder if it doesn't exist
    try {
      await vscode.workspace.fs.stat(targetFolder);
    } catch {
      await vscode.workspace.fs.createDirectory(targetFolder);
    }

    // Read file content
    const fileContent = await vscode.workspace.fs.readFile(sourceUri);

    // Write to target location
    await vscode.workspace.fs.writeFile(targetUri, fileContent);

    // Delete from source location
    await vscode.workspace.fs.delete(sourceUri);

    return true;
  } catch (error) {
    console.log(`Could not organize ${fileName}: ${error}`);
    return false;
  }
}

/**
 * Determine folder based on file naming conventions
 */
function determineFolderFromFileName(fileName: string): string | null {
  const lowerName = fileName.toLowerCase();

  // Controller detection
  if (lowerName.includes("controller") && lowerName.endsWith(".java")) {
    return "controller";
  }

  // Service detection
  if (
    (lowerName.includes("service") && lowerName.endsWith(".java")) ||
    (lowerName.includes("serviceimpl") && lowerName.endsWith(".java"))
  ) {
    return "service";
  }

  // Repository detection
  if (lowerName.includes("repository") && lowerName.endsWith(".java")) {
    return "repository";
  }

  // Entity detection
  if (
    (lowerName.endsWith("entity.java") || 
     lowerName.endsWith("model.java") ||
     (lowerName.endsWith(".java") && !lowerName.includes("dto") && 
      !lowerName.includes("service") && !lowerName.includes("controller") &&
      !lowerName.includes("repository") && !lowerName.includes("mapper") &&
      !lowerName.includes("converter") && !lowerName.includes("exception") &&
      !lowerName.includes("config") && !lowerName.includes("test") &&
      !lowerName.includes("handler") && !lowerName.includes("util") &&
      !lowerName.includes("constant") && !lowerName.includes("application")))
  ) {
    return "entity";
  }

  // DTO detection
  if (
    (lowerName.includes("dto") || 
     lowerName.includes("request") || 
     lowerName.includes("response")) &&
    lowerName.endsWith(".java")
  ) {
    return "dto";
  }

  // Mapper detection
  if (lowerName.includes("mapper") && lowerName.endsWith(".java")) {
    return "mapper";
  }

  // Converter detection
  if (lowerName.includes("converter") && lowerName.endsWith(".java")) {
    return "mapper"; // Converters go in mapper folder
  }

  // Exception detection
  if (lowerName.includes("exception") && lowerName.endsWith(".java")) {
    return "exception";
  }

  // Exception handler detection
  if (lowerName.includes("handler") && lowerName.endsWith(".java")) {
    return "exception";
  }

  // Config detection
  if (lowerName.includes("config") && lowerName.endsWith(".java")) {
    return "config";
  }

  // Utility detection
  if (lowerName.includes("util") && lowerName.endsWith(".java")) {
    return "util";
  }

  // Constants detection
  if (lowerName.includes("constant") && lowerName.endsWith(".java")) {
    return "constants";
  }

  // Test detection
  if (lowerName.includes("test") && lowerName.endsWith(".java")) {
    return "test";
  }

  return null;
}

/**
 * Analyze project structure and provide recommendations
 */
export async function analyzeProjectStructure(): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const srcPath = vscode.Uri.joinPath(workspaceFolder.uri, "src", "main", "java");

    // Get all Java files
    const files = await vscode.workspace.fs.readDirectory(srcPath);
    const javaFiles = files.filter(([name, type]) => 
      type === vscode.FileType.File && name.endsWith(".java")
    );

    // Analyze file distribution
    const analysis = analyzeFileDistribution(javaFiles.map(([name]) => name));

    // Create analysis report
    const report = createAnalysisReport(analysis);

    // Show in information message
    vscode.window.showInformationMessage(report);

    // Also create an output channel for detailed view
    const outputChannel = vscode.window.createOutputChannel("Spring Code Generator - Analysis");
    outputChannel.appendLine("=== Project Structure Analysis ===\n");
    outputChannel.appendLine(report);
    outputChannel.appendLine("\n=== File Distribution ===");
    
    for (const [folder, count] of Object.entries(analysis.folderDistribution)) {
      outputChannel.appendLine(`${folder}: ${count} files`);
    }
    
    outputChannel.appendLine(`\n=== Unorganized Files ===`);
    if (analysis.unorganizedFiles.length > 0) {
      analysis.unorganizedFiles.forEach(file => {
        outputChannel.appendLine(`- ${file}`);
      });
    } else {
      outputChannel.appendLine("No unorganized files found!");
    }

    outputChannel.show();
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error analyzing project: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Analyze file distribution
 */
function analyzeFileDistribution(
  fileNames: string[]
): {
  folderDistribution: { [key: string]: number };
  unorganizedFiles: string[];
} {
  const folderDistribution: { [key: string]: number } = {};
  const unorganizedFiles: string[] = [];

  for (const fileName of fileNames) {
    const folder = determineFolderFromFileName(fileName);
    if (folder) {
      folderDistribution[folder] = (folderDistribution[folder] || 0) + 1;
    } else {
      unorganizedFiles.push(fileName);
    }
  }

  return { folderDistribution, unorganizedFiles };
}

/**
 * Create analysis report
 */
function createAnalysisReport(analysis: {
  folderDistribution: { [key: string]: number };
  unorganizedFiles: string[];
}): string {
  const totalFiles =
    Object.values(analysis.folderDistribution).reduce((a, b) => a + b, 0) +
    analysis.unorganizedFiles.length;

  let report = `Project Structure Analysis:\n`;
  report += `Total Java Files: ${totalFiles}\n`;
  report += `Organized Files: ${totalFiles - analysis.unorganizedFiles.length}\n`;
  report += `Unorganized Files: ${analysis.unorganizedFiles.length}`;

  return report;
}
