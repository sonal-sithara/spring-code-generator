"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventDrivenSchema = void 0;
exports.eventDrivenSchema = {
    title: "Create Event-Driven Component",
    description: "Generate Producer / Consumer components for Kafka or RabbitMQ.",
    fields: [
        {
            kind: "select",
            name: "messagingType",
            label: "Messaging System",
            options: [
                { value: "Kafka", label: "Kafka", description: "Apache Kafka event streaming" },
                { value: "RabbitMQ", label: "RabbitMQ", description: "RabbitMQ message broker" },
            ],
            default: "Kafka",
            required: true,
        },
        {
            kind: "select",
            name: "componentType",
            label: "Component Type",
            options: [
                { value: "Producer", label: "Producer", description: "Sends messages / events" },
                { value: "Consumer", label: "Consumer", description: "Receives messages / events" },
                { value: "Both", label: "Both", description: "Producer and Consumer" },
            ],
            default: "Both",
            required: true,
        },
        {
            kind: "text",
            name: "topicOrQueue",
            label: "Topic / Queue Name",
            placeholder: "user-events, order-notifications",
            required: true,
        },
        {
            kind: "text",
            name: "groupId",
            label: "Consumer Group ID",
            placeholder: "user-service-group",
            showWhen: { field: "componentType", equals: ["Consumer", "Both"] },
        },
        {
            kind: "text",
            name: "messageType",
            label: "Message / Event Class Name",
            placeholder: "UserEvent, OrderMessage",
            default: "Message",
            required: true,
        },
    ],
};
//# sourceMappingURL=eventDrivenSchema.js.map