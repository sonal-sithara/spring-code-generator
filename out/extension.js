"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fileGenerator_1 = require("./generators/fileGenerator");
const moduleGenerator_1 = require("./generators/moduleGenerator");
const structureGenerator_1 = require("./generators/structureGenerator");
const relationshipGenerator_1 = require("./generators/relationshipGenerator");
const configurationGenerator_1 = require("./generators/configurationGenerator");
const fileOrganizationGenerator_1 = require("./generators/fileOrganizationGenerator");
const apiDocumentationGenerator_1 = require("./generators/apiDocumentationGenerator");
const migrationGenerator_1 = require("./generators/migrationGenerator");
const versioningGenerator_1 = require("./generators/versioningGenerator");
const customQueryGenerator_1 = require("./generators/customQueryGenerator");
const microservicesGenerator_1 = require("./generators/microservicesGenerator");
const eventDrivenGenerator_1 = require("./generators/eventDrivenGenerator");
const cachingSchedulingGenerator_1 = require("./generators/cachingSchedulingGenerator");
// Command definitions
const COMMANDS = {
    CREATE_CONTROLLER: "spring-code-generator.createController",
    CREATE_CONTROLLER_WITH_CRUD: "spring-code-generator.createControllerWithCrud",
    CREATE_ENTITY: "spring-code-generator.createEntity",
    CREATE_ENTITY_WITH_LOMBOK: "spring-code-generator.createEntityWithLombok",
    CREATE_DTO: "spring-code-generator.createDto",
    CREATE_DTO_WITH_LOMBOK: "spring-code-generator.createDtoWithLombok",
    CREATE_REPOSITORY: "spring-code-generator.createRepository",
    CREATE_EXCEPTION: "spring-code-generator.createException",
    CREATE_GLOBAL_EXCEPTION_HANDLER: "spring-code-generator.createGlobalExceptionHandler",
    CREATE_APPLICATION_PROPERTIES: "spring-code-generator.createApplicationProperties",
    CREATE_APPLICATION_YML: "spring-code-generator.createApplicationYml",
    CREATE_MAPPER: "spring-code-generator.createMapper",
    CREATE_CONVERTER: "spring-code-generator.createConverter",
    CREATE_SECURITY_CONFIG: "spring-code-generator.createSecurityConfig",
    CREATE_TEST_CLASS: "spring-code-generator.createTestClass",
    CREATE_SERVICE_IMPL: "spring-code-generator.createServiceImpl",
    CREATE_REQUEST_DTO: "spring-code-generator.createRequestDto",
    CREATE_RESPONSE_DTO: "spring-code-generator.createResponseDto",
    CREATE_BATCH_MODULE: "spring-code-generator.createBatchModule",
    CREATE_PROJECT_STRUCTURE: "spring-code-generator.createProjectStructure",
    CREATE_RELATIONSHIP: "spring-code-generator.createRelationship",
    CREATE_CONFIGURATION: "spring-code-generator.createConfiguration",
    ORGANIZE_PROJECT_FILES: "spring-code-generator.organizeProjectFiles",
    ANALYZE_PROJECT_STRUCTURE: "spring-code-generator.analyzeProjectStructure",
    CREATE_API_DOCUMENTATION: "spring-code-generator.createApiDocumentation",
    // Advanced Features
    CREATE_DATABASE_MIGRATION: "spring-code-generator.createDatabaseMigration",
    CREATE_VERSIONED_CONTROLLER: "spring-code-generator.createVersionedController",
    CREATE_CUSTOM_QUERY: "spring-code-generator.createCustomQuery",
    QUERY_SUGGESTIONS: "spring-code-generator.querySuggestions",
    CREATE_MICROSERVICE_COMPONENT: "spring-code-generator.createMicroserviceComponent",
    CREATE_EVENT_DRIVEN_COMPONENT: "spring-code-generator.createEventDrivenComponent",
    CREATE_CACHING_CONFIG: "spring-code-generator.createCachingConfig",
    CREATE_SCHEDULED_TASK: "spring-code-generator.createScheduledTask",
};
// Template type mappings
const TEMPLATE_TYPES = {
    CONTROLLER: "controller",
    CONTROLLER_WITH_CRUD: "controller-with-crud",
    ENTITY: "entity",
    ENTITY_WITH_LOMBOK: "entity-with-lombok",
    DTO: "dto",
    DTO_WITH_LOMBOK: "dto-with-lombok",
    REPOSITORY: "repository",
    EXCEPTION: "exception",
    GLOBAL_EXCEPTION_HANDLER: "global-exception-handler",
    APPLICATION_PROPERTIES: "application-properties",
    APPLICATION_YML: "application-yml",
    MAPPER: "mapper",
    CONVERTER: "converter",
    SECURITY_CONFIG: "security-config",
    TEST_CLASS: "test-class",
    SERVICE_IMPL: "service-impl",
    REQUEST_DTO: "request-dto",
    RESPONSE_DTO: "response-dto",
};
/**
 * Activates the Spring Code Generator extension
 */
function activate(context) {
    console.log("Spring Code Generator Extension activated");
    const disposables = registerCommands();
    context.subscriptions.push(...disposables);
}
exports.activate = activate;
/**
 * Registers all extension commands
 */
function registerCommands() {
    const disposables = [];
    const commandConfigs = [
        { command: COMMANDS.CREATE_CONTROLLER, type: TEMPLATE_TYPES.CONTROLLER },
        {
            command: COMMANDS.CREATE_CONTROLLER_WITH_CRUD,
            type: TEMPLATE_TYPES.CONTROLLER_WITH_CRUD,
        },
        { command: COMMANDS.CREATE_ENTITY, type: TEMPLATE_TYPES.ENTITY },
        {
            command: COMMANDS.CREATE_ENTITY_WITH_LOMBOK,
            type: TEMPLATE_TYPES.ENTITY_WITH_LOMBOK,
        },
        { command: COMMANDS.CREATE_DTO, type: TEMPLATE_TYPES.DTO },
        {
            command: COMMANDS.CREATE_DTO_WITH_LOMBOK,
            type: TEMPLATE_TYPES.DTO_WITH_LOMBOK,
        },
        { command: COMMANDS.CREATE_REPOSITORY, type: TEMPLATE_TYPES.REPOSITORY },
        { command: COMMANDS.CREATE_EXCEPTION, type: TEMPLATE_TYPES.EXCEPTION },
        {
            command: COMMANDS.CREATE_GLOBAL_EXCEPTION_HANDLER,
            type: TEMPLATE_TYPES.GLOBAL_EXCEPTION_HANDLER,
        },
        {
            command: COMMANDS.CREATE_APPLICATION_PROPERTIES,
            type: TEMPLATE_TYPES.APPLICATION_PROPERTIES,
        },
        {
            command: COMMANDS.CREATE_APPLICATION_YML,
            type: TEMPLATE_TYPES.APPLICATION_YML,
        },
        { command: COMMANDS.CREATE_MAPPER, type: TEMPLATE_TYPES.MAPPER },
        { command: COMMANDS.CREATE_CONVERTER, type: TEMPLATE_TYPES.CONVERTER },
        {
            command: COMMANDS.CREATE_SECURITY_CONFIG,
            type: TEMPLATE_TYPES.SECURITY_CONFIG,
        },
        { command: COMMANDS.CREATE_TEST_CLASS, type: TEMPLATE_TYPES.TEST_CLASS },
        {
            command: COMMANDS.CREATE_SERVICE_IMPL,
            type: TEMPLATE_TYPES.SERVICE_IMPL,
        },
        {
            command: COMMANDS.CREATE_REQUEST_DTO,
            type: TEMPLATE_TYPES.REQUEST_DTO,
        },
        {
            command: COMMANDS.CREATE_RESPONSE_DTO,
            type: TEMPLATE_TYPES.RESPONSE_DTO,
        },
    ];
    commandConfigs.forEach(({ command, type }) => {
        disposables.push(vscode.commands.registerCommand(command, async (folder) => {
            await (0, fileGenerator_1.createFile)(folder, type);
        }));
    });
    // Register batch module command separately
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_BATCH_MODULE, async (folder) => {
        await (0, moduleGenerator_1.createBatchModule)(folder);
    }));
    // Register project structure command
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_PROJECT_STRUCTURE, async (folder) => {
        await (0, structureGenerator_1.createProjectStructure)(folder);
    }));
    // Register relationship command
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_RELATIONSHIP, async (folder) => {
        await (0, relationshipGenerator_1.createRelationship)();
    }));
    // Register configuration command
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_CONFIGURATION, async (folder) => {
        await (0, configurationGenerator_1.createConfiguration)();
    }));
    // Register organize project files command
    disposables.push(vscode.commands.registerCommand(COMMANDS.ORGANIZE_PROJECT_FILES, async () => {
        await (0, fileOrganizationGenerator_1.organizeProjectFiles)();
    }));
    // Register analyze project structure command
    disposables.push(vscode.commands.registerCommand(COMMANDS.ANALYZE_PROJECT_STRUCTURE, async () => {
        await (0, fileOrganizationGenerator_1.analyzeProjectStructure)();
    }));
    // Register API documentation command
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_API_DOCUMENTATION, async () => {
        await (0, apiDocumentationGenerator_1.createApiDocumentation)();
    }));
    // Register advanced feature commands
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_DATABASE_MIGRATION, async (folder) => {
        await (0, migrationGenerator_1.createDatabaseMigration)(folder);
    }));
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_VERSIONED_CONTROLLER, async (folder) => {
        await (0, versioningGenerator_1.createVersionedController)(folder);
    }));
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_CUSTOM_QUERY, async (folder) => {
        await (0, customQueryGenerator_1.createCustomQueryRepository)(folder);
    }));
    disposables.push(vscode.commands.registerCommand(COMMANDS.QUERY_SUGGESTIONS, async (folder) => {
        await (0, customQueryGenerator_1.generateQuerySuggestions)(folder);
    }));
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_MICROSERVICE_COMPONENT, async (folder) => {
        await (0, microservicesGenerator_1.createMicroserviceComponent)(folder);
    }));
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_EVENT_DRIVEN_COMPONENT, async (folder) => {
        await (0, eventDrivenGenerator_1.createEventDrivenComponent)(folder);
    }));
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_CACHING_CONFIG, async (folder) => {
        await (0, cachingSchedulingGenerator_1.createCachingConfiguration)(folder);
    }));
    disposables.push(vscode.commands.registerCommand(COMMANDS.CREATE_SCHEDULED_TASK, async (folder) => {
        await (0, cachingSchedulingGenerator_1.createScheduledTask)(folder);
    }));
    return disposables;
}
/**
 * Deactivates the extension
 */
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map