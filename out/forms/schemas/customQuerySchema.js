"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customQuerySchema = void 0;
const common_1 = require("./common");
exports.customQuerySchema = {
    title: "Create Custom Query Repository",
    description: "Generate a Spring Data JPA repository with custom query methods.",
    submitLabel: "Generate Repository",
    fields: [
        {
            kind: "text",
            name: "entityName",
            label: "Entity Name",
            placeholder: "User, Product, Order",
            required: true,
        },
        {
            kind: "select",
            name: "idType",
            label: "ID Data Type",
            options: common_1.ID_TYPE_OPTIONS,
            default: "Long",
            required: true,
        },
        {
            kind: "list",
            name: "queries",
            label: "Custom Query Methods",
            itemLabel: "Query",
            defaultItems: 1,
            fields: [
                {
                    kind: "text",
                    name: "methodName",
                    label: "Method Name",
                    placeholder: "findByEmail, findActiveUsers",
                    required: true,
                },
                {
                    kind: "select",
                    name: "queryType",
                    label: "Query Type",
                    options: [
                        { value: "SELECT", label: "SELECT", description: "Retrieve data" },
                        { value: "UPDATE", label: "UPDATE", description: "Modify data" },
                        { value: "DELETE", label: "DELETE", description: "Remove data" },
                        { value: "NATIVE", label: "NATIVE", description: "Native SQL query" },
                    ],
                    default: "SELECT",
                    required: true,
                },
                {
                    kind: "select",
                    name: "returnType",
                    label: "Return Type",
                    options: [
                        { value: "Single", label: "Single", description: "Returns single entity" },
                        { value: "List", label: "List", description: "Returns List<Entity>" },
                        { value: "Page", label: "Page", description: "Returns Page<Entity>" },
                        { value: "Optional", label: "Optional", description: "Returns Optional<Entity>" },
                        { value: "Count", label: "Count", description: "Returns Long" },
                        { value: "Boolean", label: "Boolean", description: "Returns boolean" },
                        { value: "Void", label: "Void", description: "No return value" },
                    ],
                    default: "List",
                    required: true,
                },
                {
                    kind: "list",
                    name: "parameters",
                    label: "Parameters",
                    itemLabel: "Parameter",
                    fields: [
                        { kind: "text", name: "name", label: "Name", placeholder: "email", required: true },
                        { kind: "text", name: "type", label: "Type", placeholder: "String, Long, LocalDateTime", required: true },
                    ],
                },
                {
                    kind: "textarea",
                    name: "query",
                    label: "Custom Query (JPQL or native SQL)",
                    placeholder: "SELECT u FROM User u WHERE u.email = :email",
                    showWhen: { field: "queryType", equals: ["NATIVE", "UPDATE", "DELETE"] },
                },
            ],
        },
    ],
};
//# sourceMappingURL=customQuerySchema.js.map