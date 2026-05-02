"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versioningSchema = void 0;
const common_1 = require("./common");
exports.versioningSchema = {
    title: "Create Versioned API Controller",
    fields: [
        {
            kind: "text",
            name: "baseName",
            label: "Controller Base Name",
            description: "Without the 'Controller' suffix.",
            placeholder: "User, Product, Order",
            required: true,
            pattern: "^[A-Z][a-zA-Z0-9]*$",
            patternError: "Must start with a capital letter and contain only letters and numbers",
        },
        {
            kind: "text",
            name: "version",
            label: "API Version",
            placeholder: "v1, v2, v3",
            default: "v1",
            required: true,
            pattern: "^v\\d+$",
            patternError: "Must be in the format v1, v2, v3, ...",
        },
        {
            kind: "checkbox",
            name: "includeVersionInPath",
            label: "Include version in URL path (e.g. /api/v1/users)",
            default: true,
        },
        {
            kind: "checkbox",
            name: "includeVersionInPackage",
            label: "Include version in package name (e.g. controller.v1)",
        },
        {
            kind: "checkbox",
            name: "includeCrud",
            label: "Include full CRUD operations",
        },
        {
            kind: "text",
            name: "entityName",
            label: "Entity Name",
            description: "Defaults to the base name.",
            placeholder: "Same as base name",
            showWhen: { field: "includeCrud", equals: true },
        },
        {
            kind: "select",
            name: "idType",
            label: "ID Data Type",
            options: common_1.ID_TYPE_OPTIONS,
            default: "Long",
            showWhen: { field: "includeCrud", equals: true },
        },
    ],
};
//# sourceMappingURL=versioningSchema.js.map