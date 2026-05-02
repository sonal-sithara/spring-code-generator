"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationSchema = void 0;
exports.migrationSchema = {
    title: "Create Database Migration",
    description: "Generate a Flyway or Liquibase migration file.",
    submitLabel: "Generate Migration",
    fields: [
        {
            kind: "select",
            name: "migrationTool",
            label: "Migration Tool",
            options: [
                { value: "Flyway", label: "Flyway", description: "SQL-based" },
                { value: "Liquibase", label: "Liquibase", description: "XML-based" },
            ],
            default: "Flyway",
            required: true,
        },
        {
            kind: "select",
            name: "action",
            label: "Action",
            options: [
                { value: "CreateTable", label: "Create Table" },
                { value: "AddColumn", label: "Add Column" },
                { value: "DropColumn", label: "Drop Column" },
                { value: "AddIndex", label: "Add Index" },
                { value: "DropTable", label: "Drop Table" },
            ],
            default: "CreateTable",
            required: true,
        },
        {
            kind: "text",
            name: "tableName",
            label: "Table Name",
            placeholder: "users",
            required: true,
        },
        {
            kind: "list",
            name: "columns",
            label: "Columns",
            description: "Define the columns for the new table. Leave empty to generate default id/created_at/updated_at columns.",
            itemLabel: "Column",
            showWhen: { field: "action", equals: "CreateTable" },
            defaultItems: 1,
            fields: [
                { kind: "text", name: "name", label: "Name", placeholder: "id", required: true },
                { kind: "text", name: "type", label: "Type", placeholder: "BIGINT, VARCHAR(255), TIMESTAMP", required: true },
                { kind: "checkbox", name: "nullable", label: "Nullable", default: false },
                { kind: "text", name: "defaultValue", label: "Default Value (optional)", placeholder: "0, '', CURRENT_TIMESTAMP" },
            ],
        },
        {
            kind: "text",
            name: "columnName",
            label: "Column Name",
            placeholder: "email",
            showWhen: { field: "action", equals: ["AddColumn", "DropColumn"] },
            required: true,
        },
        {
            kind: "text",
            name: "columnType",
            label: "Column Type",
            placeholder: "VARCHAR(255)",
            showWhen: { field: "action", equals: "AddColumn" },
            required: true,
        },
        {
            kind: "text",
            name: "indexName",
            label: "Index Name",
            placeholder: "idx_user_email",
            showWhen: { field: "action", equals: "AddIndex" },
            required: true,
        },
        {
            kind: "text",
            name: "indexColumns",
            label: "Index Columns",
            description: "Comma-separated list of columns.",
            placeholder: "email, username",
            showWhen: { field: "action", equals: "AddIndex" },
            required: true,
        },
    ],
};
//# sourceMappingURL=migrationSchema.js.map