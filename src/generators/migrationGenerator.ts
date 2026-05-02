import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { requireFolderPath } from "../utils/validation";
import { showForm } from "../forms/FormPanel";
import { migrationSchema } from "../forms/schemas/migrationSchema";
import { FormResult } from "../forms/types";
import { getBool, getList, getOptionalString, getString } from "../forms/utils";

export interface MigrationConfig {
  migrationTool: "Flyway" | "Liquibase";
  action: "CreateTable" | "AddColumn" | "DropColumn" | "AddIndex" | "DropTable";
  tableName: string;
  columns?: Array<{ name: string; type: string; nullable: boolean; defaultValue?: string }>;
  columnName?: string;
  columnType?: string;
  indexName?: string;
  indexColumns?: string[];
}

export async function createDatabaseMigration(uri: vscode.Uri | undefined) {
  try {
    const folderPath = requireFolderPath(uri);
    if (!folderPath) {
      return;
    }

    const result = await showForm(migrationSchema);
    if (!result) {
      return;
    }

    const config = formResultToMigrationConfig(result);

    const migrationContent = generateMigrationContent(config);
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

    let fileName: string;
    let migrationPath: string;

    if (config.migrationTool === "Flyway") {
      fileName = `V${timestamp}__${config.action}_${config.tableName}.sql`;
      migrationPath = path.join(folderPath, "db", "migration");
    } else {
      fileName = `${timestamp}-${config.action}-${config.tableName}.xml`;
      migrationPath = path.join(folderPath, "db", "changelog");
    }

    fs.mkdirSync(migrationPath, { recursive: true });

    const filePath = path.join(migrationPath, fileName);
    fs.writeFileSync(filePath, migrationContent);

    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      `✅ ${config.migrationTool} migration created: ${fileName}`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to create migration: ${error.message}`
    );
  }
}

function formResultToMigrationConfig(result: FormResult): MigrationConfig {
  const columns = getList(result, "columns")
    .map((c) => ({
      name: getString(c, "name"),
      type: getString(c, "type"),
      nullable: getBool(c, "nullable"),
      defaultValue: getOptionalString(c, "defaultValue"),
    }))
    .filter((c) => c.name && c.type);

  const indexColumnsRaw = getString(result, "indexColumns");

  return {
    migrationTool: result.migrationTool as "Flyway" | "Liquibase",
    action: result.action as MigrationConfig["action"],
    tableName: getString(result, "tableName"),
    columns: columns.length > 0 ? columns : undefined,
    columnName: getOptionalString(result, "columnName"),
    columnType: getOptionalString(result, "columnType"),
    indexName: getOptionalString(result, "indexName"),
    indexColumns: indexColumnsRaw
      ? indexColumnsRaw.split(",").map((c) => c.trim()).filter((c) => c.length > 0)
      : undefined,
  };
}

function generateMigrationContent(config: MigrationConfig): string {
  if (config.migrationTool === "Flyway") {
    return generateFlywayMigration(config);
  } else {
    return generateLiquibaseMigration(config);
  }
}

function generateFlywayMigration(config: MigrationConfig): string {
  let sql = `-- Flyway Migration\n-- Action: ${config.action}\n-- Table: ${config.tableName}\n\n`;

  switch (config.action) {
    case "CreateTable":
      sql += `CREATE TABLE ${config.tableName} (\n`;
      if (config.columns && config.columns.length > 0) {
        sql += config.columns
          .map((col) => {
            let columnDef = `    ${col.name} ${col.type}`;
            if (!col.nullable) {
              columnDef += " NOT NULL";
            }
            if (col.defaultValue) {
              columnDef += ` DEFAULT ${col.defaultValue}`;
            }
            return columnDef;
          })
          .join(",\n");
        sql += "\n);\n";
      } else {
        sql += `    id BIGINT PRIMARY KEY AUTO_INCREMENT,\n`;
        sql += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
        sql += `    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
        sql += ");\n";
      }
      break;

    case "AddColumn":
      sql += `ALTER TABLE ${config.tableName}\n`;
      sql += `ADD COLUMN ${config.columnName} ${config.columnType};\n`;
      break;

    case "DropColumn":
      sql += `ALTER TABLE ${config.tableName}\n`;
      sql += `DROP COLUMN ${config.columnName};\n`;
      break;

    case "AddIndex":
      sql += `CREATE INDEX ${config.indexName}\n`;
      sql += `ON ${config.tableName} (${config.indexColumns?.join(", ")});\n`;
      break;

    case "DropTable":
      sql += `DROP TABLE IF EXISTS ${config.tableName};\n`;
      break;
  }

  return sql;
}

function generateLiquibaseMigration(config: MigrationConfig): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<databaseChangeLog\n`;
  xml += `    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"\n`;
  xml += `    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog\n`;
  xml += `    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">\n\n`;

  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  xml += `    <changeSet id="${timestamp}" author="spring-code-generator">\n`;

  switch (config.action) {
    case "CreateTable":
      xml += `        <createTable tableName="${config.tableName}">\n`;
      if (config.columns && config.columns.length > 0) {
        config.columns.forEach((col) => {
          xml += `            <column name="${col.name}" type="${col.type}">\n`;
          if (!col.nullable) {
            xml += `                <constraints nullable="false"/>\n`;
          }
          if (col.defaultValue) {
            xml += `                <constraints defaultValue="${col.defaultValue}"/>\n`;
          }
          xml += `            </column>\n`;
        });
      } else {
        xml += `            <column name="id" type="BIGINT" autoIncrement="true">\n`;
        xml += `                <constraints primaryKey="true" nullable="false"/>\n`;
        xml += `            </column>\n`;
        xml += `            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>\n`;
        xml += `            <column name="updated_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>\n`;
      }
      xml += `        </createTable>\n`;
      break;

    case "AddColumn":
      xml += `        <addColumn tableName="${config.tableName}">\n`;
      xml += `            <column name="${config.columnName}" type="${config.columnType}"/>\n`;
      xml += `        </addColumn>\n`;
      break;

    case "DropColumn":
      xml += `        <dropColumn tableName="${config.tableName}" columnName="${config.columnName}"/>\n`;
      break;

    case "AddIndex":
      xml += `        <createIndex indexName="${config.indexName}" tableName="${config.tableName}">\n`;
      config.indexColumns?.forEach((col) => {
        xml += `            <column name="${col}"/>\n`;
      });
      xml += `        </createIndex>\n`;
      break;

    case "DropTable":
      xml += `        <dropTable tableName="${config.tableName}"/>\n`;
      break;
  }

  xml += `    </changeSet>\n`;
  xml += `</databaseChangeLog>\n`;

  return xml;
}
