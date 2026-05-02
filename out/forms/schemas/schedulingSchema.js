"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulingSchema = void 0;
exports.schedulingSchema = {
    title: "Create Scheduled Task",
    fields: [
        {
            kind: "text",
            name: "taskName",
            label: "Task Name",
            placeholder: "DataCleanup, ReportGeneration, EmailReminder",
            required: true,
        },
        {
            kind: "select",
            name: "schedulerType",
            label: "Scheduler Type",
            options: [
                { value: "Cron", label: "Cron", description: "Cron expression" },
                { value: "FixedRate", label: "Fixed Rate", description: "Fixed interval between starts" },
                { value: "FixedDelay", label: "Fixed Delay", description: "Fixed delay between completions" },
            ],
            default: "Cron",
            required: true,
        },
        {
            kind: "select",
            name: "cronPreset",
            label: "Cron Expression",
            options: [
                { value: "0 0 * * * *", label: "0 0 * * * *", description: "Every hour" },
                { value: "0 0 0 * * *", label: "0 0 0 * * *", description: "Every day at midnight" },
                { value: "0 0 9 * * MON-FRI", label: "0 0 9 * * MON-FRI", description: "Weekdays at 9 AM" },
                { value: "0 */15 * * * *", label: "0 */15 * * * *", description: "Every 15 minutes" },
                { value: "0 0 12 * * *", label: "0 0 12 * * *", description: "Every day at noon" },
                { value: "Custom", label: "Custom...", description: "Enter your own expression" },
            ],
            default: "0 0 12 * * *",
            showWhen: { field: "schedulerType", equals: "Cron" },
        },
        {
            kind: "text",
            name: "cronExpression",
            label: "Custom Cron Expression",
            placeholder: "0 0 12 * * *",
            showWhen: { field: "cronPreset", equals: "Custom" },
            required: true,
        },
        {
            kind: "text",
            name: "fixedRate",
            label: "Fixed Rate (milliseconds)",
            placeholder: "60000",
            default: "60000",
            showWhen: { field: "schedulerType", equals: "FixedRate" },
            required: true,
            pattern: "^\\d+$",
            patternError: "Must be a positive integer",
        },
        {
            kind: "text",
            name: "fixedDelay",
            label: "Fixed Delay (milliseconds)",
            placeholder: "60000",
            default: "60000",
            showWhen: { field: "schedulerType", equals: "FixedDelay" },
            required: true,
            pattern: "^\\d+$",
            patternError: "Must be a positive integer",
        },
    ],
};
//# sourceMappingURL=schedulingSchema.js.map