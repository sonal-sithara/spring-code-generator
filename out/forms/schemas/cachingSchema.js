"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachingSchema = void 0;
exports.cachingSchema = {
    title: "Create Caching Configuration",
    fields: [
        {
            kind: "select",
            name: "cacheProvider",
            label: "Cache Provider",
            options: [
                { value: "Redis", label: "Redis", description: "Distributed caching" },
                { value: "Caffeine", label: "Caffeine", description: "High-performance in-memory" },
                { value: "EhCache", label: "EhCache", description: "Popular Java caching" },
            ],
            default: "Redis",
            required: true,
        },
        {
            kind: "text",
            name: "cacheName",
            label: "Cache Name",
            placeholder: "users, products, orders",
            default: "defaultCache",
            required: true,
        },
        {
            kind: "checkbox",
            name: "includeService",
            label: "Include service example with caching",
        },
        {
            kind: "text",
            name: "entityName",
            label: "Entity Name (for service example)",
            placeholder: "User, Product, Order",
            showWhen: { field: "includeService", equals: true },
            required: true,
        },
    ],
};
//# sourceMappingURL=cachingSchema.js.map