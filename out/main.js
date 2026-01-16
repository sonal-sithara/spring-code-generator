"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScheduledTask = exports.createCachingConfiguration = exports.createEventDrivenComponent = exports.createMicroserviceComponent = exports.generateQuerySuggestions = exports.createCustomQueryRepository = exports.createVersionedController = exports.createDatabaseMigration = exports.createApiDocumentation = exports.analyzeProjectStructure = exports.organizeProjectFiles = exports.createConfiguration = exports.createRelationship = exports.createProjectStructure = exports.createBatchModule = exports.createFile = void 0;
// Re-export all functions from generators for backward compatibility
var fileGenerator_1 = require("./generators/fileGenerator");
Object.defineProperty(exports, "createFile", { enumerable: true, get: function () { return fileGenerator_1.createFile; } });
var moduleGenerator_1 = require("./generators/moduleGenerator");
Object.defineProperty(exports, "createBatchModule", { enumerable: true, get: function () { return moduleGenerator_1.createBatchModule; } });
var structureGenerator_1 = require("./generators/structureGenerator");
Object.defineProperty(exports, "createProjectStructure", { enumerable: true, get: function () { return structureGenerator_1.createProjectStructure; } });
var relationshipGenerator_1 = require("./generators/relationshipGenerator");
Object.defineProperty(exports, "createRelationship", { enumerable: true, get: function () { return relationshipGenerator_1.createRelationship; } });
var configurationGenerator_1 = require("./generators/configurationGenerator");
Object.defineProperty(exports, "createConfiguration", { enumerable: true, get: function () { return configurationGenerator_1.createConfiguration; } });
var fileOrganizationGenerator_1 = require("./generators/fileOrganizationGenerator");
Object.defineProperty(exports, "organizeProjectFiles", { enumerable: true, get: function () { return fileOrganizationGenerator_1.organizeProjectFiles; } });
Object.defineProperty(exports, "analyzeProjectStructure", { enumerable: true, get: function () { return fileOrganizationGenerator_1.analyzeProjectStructure; } });
var apiDocumentationGenerator_1 = require("./generators/apiDocumentationGenerator");
Object.defineProperty(exports, "createApiDocumentation", { enumerable: true, get: function () { return apiDocumentationGenerator_1.createApiDocumentation; } });
var migrationGenerator_1 = require("./generators/migrationGenerator");
Object.defineProperty(exports, "createDatabaseMigration", { enumerable: true, get: function () { return migrationGenerator_1.createDatabaseMigration; } });
var versioningGenerator_1 = require("./generators/versioningGenerator");
Object.defineProperty(exports, "createVersionedController", { enumerable: true, get: function () { return versioningGenerator_1.createVersionedController; } });
var customQueryGenerator_1 = require("./generators/customQueryGenerator");
Object.defineProperty(exports, "createCustomQueryRepository", { enumerable: true, get: function () { return customQueryGenerator_1.createCustomQueryRepository; } });
Object.defineProperty(exports, "generateQuerySuggestions", { enumerable: true, get: function () { return customQueryGenerator_1.generateQuerySuggestions; } });
var microservicesGenerator_1 = require("./generators/microservicesGenerator");
Object.defineProperty(exports, "createMicroserviceComponent", { enumerable: true, get: function () { return microservicesGenerator_1.createMicroserviceComponent; } });
var eventDrivenGenerator_1 = require("./generators/eventDrivenGenerator");
Object.defineProperty(exports, "createEventDrivenComponent", { enumerable: true, get: function () { return eventDrivenGenerator_1.createEventDrivenComponent; } });
var cachingSchedulingGenerator_1 = require("./generators/cachingSchedulingGenerator");
Object.defineProperty(exports, "createCachingConfiguration", { enumerable: true, get: function () { return cachingSchedulingGenerator_1.createCachingConfiguration; } });
Object.defineProperty(exports, "createScheduledTask", { enumerable: true, get: function () { return cachingSchedulingGenerator_1.createScheduledTask; } });
// Re-export types
__exportStar(require("./types"), exports);
__exportStar(require("./constants"), exports);
//# sourceMappingURL=main.js.map