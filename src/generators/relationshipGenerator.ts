import * as vscode from "vscode";
import {
  getClassName,
  getRelationshipType,
  getRelationshipName,
  getTargetEntityName,
  getBidirectionalOption,
  getCascadeOptions,
} from "../utils/validation";
import { RelationshipConfig } from "../types";

/**
 * Generate JPA relationship annotations for Spring entities
 * Supports OneToMany, ManyToOne, ManyToMany with cascading and bidirectional options
 */
export async function createRelationship(): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    // Get configuration from user
    const className = await getClassName("Entity class name (e.g., User):");
    if (!className) {
      return;
    }

    const relationshipType = await getRelationshipType();
    if (!relationshipType) {
      return;
    }

    const relationshipName = await getRelationshipName(
      "Relationship field name (e.g., posts, comments):"
    );
    if (!relationshipName) {
      return;
    }

    const targetEntity = await getTargetEntityName(
      "Target entity name (e.g., Post, Comment):"
    );
    if (!targetEntity) {
      return;
    }

    const isBidirectional = await getBidirectionalOption();

    const cascadeOptions = await getCascadeOptions();

    const config: RelationshipConfig = {
      className,
      relationshipType: relationshipType as "OneToMany" | "ManyToOne" | "ManyToMany",
      relationshipName,
      targetEntity,
      isBidirectional,
      cascadeOptions,
    };

    // Generate relationship code snippet
    const relationshipCode = generateRelationshipCode(config);

    // Create file with relationship code
    const fileName = `${className}-${relationshipName}.relationship.txt`;
    const uri = vscode.Uri.joinPath(workspaceFolder.uri, "src", "main", "java", fileName);
    await vscode.workspace.fs.writeFile(
      uri,
      Buffer.from(relationshipCode)
    );

    vscode.window.showInformationMessage(
      `✓ Relationship code generated for ${className}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error generating relationship: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate relationship annotation code based on configuration
 */
function generateRelationshipCode(config: RelationshipConfig): string {
  const { className, relationshipType, relationshipName, targetEntity, isBidirectional, cascadeOptions } = config;

  let annotation = "";
  let fieldDeclaration = "";
  let mappedByAnnotation = "";

  const cascadeString = cascadeOptions.length > 0 ? `, cascade = {${cascadeOptions.map((c) => `CascadeType.${c}`).join(", ")}}` : "";

  switch (relationshipType) {
    case "OneToMany":
      annotation = `@OneToMany(mappedBy = "${mapRelationshipName(relationshipName)}"${cascadeString})`;
      fieldDeclaration = `private List<${targetEntity}> ${relationshipName} = new ArrayList<>();`;
      mappedByAnnotation = isBidirectional
        ? `\n\n// In ${targetEntity} entity:\n@ManyToOne${cascadeString}\nprivate ${className} ${mapRelationshipName(className)};`
        : "";
      break;

    case "ManyToOne":
      annotation = `@ManyToOne${cascadeString}`;
      fieldDeclaration = `private ${targetEntity} ${relationshipName};`;
      mappedByAnnotation = isBidirectional
        ? `\n\n// In ${targetEntity} entity:\n@OneToMany(mappedBy = "${mapRelationshipName(relationshipName)}"${cascadeString})\nprivate List<${className}> ${pluralize(relationshipName)} = new ArrayList<>();`
        : "";
      break;

    case "ManyToMany":
      annotation = `@ManyToMany${cascadeString}`;
      fieldDeclaration = `private List<${targetEntity}> ${relationshipName} = new ArrayList<>();`;
      mappedByAnnotation = isBidirectional
        ? `\n\n// In ${targetEntity} entity:\n@ManyToMany(mappedBy = "${relationshipName}"${cascadeString})\nprivate List<${className}> ${pluralize(relationshipName)} = new ArrayList<>();`
        : "";
      break;

    default:
      annotation = `@OneToMany(mappedBy = "${mapRelationshipName(relationshipName)}"${cascadeString})`;
      fieldDeclaration = `private List<${targetEntity}> ${relationshipName} = new ArrayList<>();`;
  }

  return `// Relationship Configuration
// Type: ${relationshipType}
// Bidirectional: ${isBidirectional ? "Yes" : "No"}
// Cascade: ${cascadeOptions.length > 0 ? cascadeOptions.join(", ") : "None"}

${annotation}
${fieldDeclaration}

// Getters and Setters
public List<${targetEntity}> get${capitalize(relationshipName)}() {
    return ${relationshipName};
}

public void set${capitalize(relationshipName)}(List<${targetEntity}> ${relationshipName}) {
    this.${relationshipName} = ${relationshipName};
}

public void add${capitalize(singularize(relationshipName))}(${targetEntity} ${mapRelationshipName(relationshipName)}) {
    this.${relationshipName}.add(${mapRelationshipName(relationshipName)});
    ${isBidirectional ? `${mapRelationshipName(relationshipName)}.set${capitalize(relationshipName.replace(/s$/, ""))}(this);` : ""}
}

public void remove${capitalize(singularize(relationshipName))}(${targetEntity} ${mapRelationshipName(relationshipName)}) {
    this.${relationshipName}.remove(${mapRelationshipName(relationshipName)});
    ${isBidirectional ? `${mapRelationshipName(relationshipName)}.set${capitalize(relationshipName.replace(/s$/, ""))}(null);` : ""}
}
${mappedByAnnotation}
`;
}

/**
 * Convert relationship name to field format (camelCase, singular)
 */
function mapRelationshipName(name: string): string {
  // Remove 's' for singular form
  const singular = name.endsWith("s") ? name.slice(0, -1) : name;
  // Convert to camelCase if not already
  return singular.charAt(0).toLowerCase() + singular.slice(1);
}

/**
 * Pluralize a word by adding 's'
 */
function pluralize(word: string): string {
  return word.endsWith("s") ? word : `${word}s`;
}

/**
 * Convert singular to singular (remove 's')
 */
function singularize(word: string): string {
  return word.endsWith("s") ? word.slice(0, -1) : word;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
