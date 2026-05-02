"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiDocumentationSchema = void 0;
exports.apiDocumentationSchema = {
    title: "Create API Documentation",
    description: "Generate Swagger / OpenAPI configuration files for your project.",
    fields: [
        {
            kind: "text",
            name: "projectName",
            label: "Project Name",
            placeholder: "MySpringApp",
            required: true,
        },
        {
            kind: "textarea",
            name: "projectDescription",
            label: "Project Description",
            placeholder: "API for ...",
        },
        {
            kind: "checkbox",
            name: "includeSecurityScheme",
            label: "Include JWT security scheme",
        },
    ],
};
//# sourceMappingURL=apiDocumentationSchema.js.map