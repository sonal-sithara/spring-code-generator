import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

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
    const folderPath = uri ? uri.fsPath : undefined;
    
    if (!folderPath) {
      vscode.window.showErrorMessage("Please select a folder first!");
      return;
    }

    // Ask for migration tool
    const migrationTool = await vscode.window.showQuickPick(
      ["Flyway", "Liquibase"],
      {
        placeHolder: "Select migration tool",
        ignoreFocusOut: true,
      }
    );

    if (!migrationTool) {
      return;
    }

    // Ask for migration action
    const action = await vscode.window.showQuickPick(
      ["CreateTable", "AddColumn", "DropColumn", "AddIndex", "DropTable"],
      {
        placeHolder: "Select migration action",
        ignoreFocusOut: true,
      }
    );

    if (!action) {
      return;
    }

    const config: MigrationConfig = {
      migrationTool: migrationTool as "Flyway" | "Liquibase",
      action: action as any,
      tableName: "",
    };

    // Get table name
    const tableName = await vscode.window.showInputBox({
      prompt: "Enter table name",
      placeHolder: "users",
      ignoreFocusOut: true,
    });

    if (!tableName) {
      return;
    }

    config.tableName = tableName;

    // Handle different actions
    if (action === "CreateTable") {
      config.columns = await collectColumns();
    } else if (action === "AddColumn") {
      const columnName = await vscode.window.showInputBox({
        prompt: "Enter column name",
        placeHolder: "email",
        ignoreFocusOut: true,
      });

      const columnType = await vscode.window.showInputBox({
        prompt: "Enter column type",
        placeHolder: "VARCHAR(255)",
        ignoreFocusOut: true,
      });

      if (columnName && columnType) {
        config.columnName = columnName;
        config.columnType = columnType;
      }
    } else if (action === "AddIndex") {
      const indexName = await vscode.window.showInputBox({
        prompt: "Enter index name",
        placeHolder: "idx_user_email",
        ignoreFocusOut: true,
      });

      const indexColumns = await vscode.window.showInputBox({
        prompt: "Enter index columns (comma-separated)",
        placeHolder: "email, username",
        ignoreFocusOut: true,
      });

      if (indexName && indexColumns) {
        config.indexName = indexName;
        config.indexColumns = indexColumns.split(",").map(c => c.trim());
      }
    }

    // Generate migration file
    const migrationContent = generateMigrationContent(config);
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    
    let fileName: string;
    let migrationPath: string;

    if (config.migrationTool === "Flyway") {
      fileName = `V${timestamp}__${action}_${tableName}.sql`;
      migrationPath = path.join(folderPath, "db", "migration");
    } else {
      fileName = `${timestamp}-${action}-${tableName}.xml`;
      migrationPath = path.join(folderPath, "db", "changelog");
    }

    // Create directories if they don't exist
    if (!fs.existsSync(migrationPath)) {
      fs.mkdirSync(migrationPath, { recursive: true });
    }

    const filePath = path.join(migrationPath, fileName);
    
    // Write file
    fs.writeFileSync(filePath, migrationContent);

    // Open the file
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

async function collectColumns(): Promise<Array<{ name: string; type: string; nullable: boolean; defaultValue?: string }>> {
  const columns: Array<{ name: string; type: string; nullable: boolean; defaultValue?: string }> = [];
  
  while (true) {
    const columnName = await vscode.window.showInputBox({
      prompt: "Enter column name (leave empty to finish)",
      placeHolder: "id, username, email",
      ignoreFocusOut: true,
    });

    if (!columnName) {
      break;
    }

    const columnType = await vscode.window.showInputBox({
      prompt: `Enter type for column '${columnName}'`,
      placeHolder: "BIGINT, VARCHAR(255), BOOLEAN, etc.",
      ignoreFocusOut: true,
    });

    if (!columnType) {
      continue;
    }

    const nullable = await vscode.window.showQuickPick(
      ["No", "Yes"],
      {
        placeHolder: "Is column nullable?",
        ignoreFocusOut: true,
      }
    );

    const defaultValue = await vscode.window.showInputBox({
      prompt: "Enter default value (leave empty for none)",
      placeHolder: "0, '', NULL",
      ignoreFocusOut: true,
    });

    columns.push({
      name: columnName,
      type: columnType,
      nullable: nullable === "Yes",
      defaultValue: defaultValue || undefined,
    });
  }

  return columns;
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
