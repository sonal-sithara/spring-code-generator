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
exports.analyzeProjectStructure = exports.organizeProjectFiles = exports.createConfiguration = exports.createRelationship = exports.createProjectStructure = exports.createBatchModule = exports.createFile = void 0;
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
// Re-export types
__exportStar(require("./types"), exports);
__exportStar(require("./constants"), exports);
//# sourceMappingURL=main.js.map