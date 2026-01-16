"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectStructure = void 0;
const vscode = require("vscode");
const path = require("path");
const fileUtils_1 = require("../utils/fileUtils");
const validation_1 = require("../utils/validation");
const constants_1 = require("../constants");
/**
 * Creates recommended Spring Boot project folder structure
 */
const createProjectStructure = async (folder) => {
    try {
        const uri = await (0, fileUtils_1.resolveFolderUri)(folder);
        const config = await getProjectStructureConfig();
        if (!config) {
            return;
        }
        const basePackagePath = uri.path;
        const foldersToCreate = [...constants_1.PROJECT_FOLDERS];
        if (config.includeTest) {
            foldersToCreate.push(...constants_1.OPTIONAL_FOLDERS);
        }
        const files = [];
        // Create folders with .gitkeep files
        foldersToCreate.forEach((folderName) => {
            const gitkeepUri = vscode.Uri.file(path.join(basePackagePath, folderName, ".gitkeep"));
            files.push({
                path: gitkeepUri,
                content: "",
            });
        });
        // Create README if selected
        if (config.includeReadme) {
            const readmeUri = vscode.Uri.file(path.join(basePackagePath, "README.md"));
            files.push({
                path: readmeUri,
                content: generateProjectReadme(config.projectName),
            });
        }
        // Create .env.example if selected
        if (config.includeEnvExample) {
            const envUri = vscode.Uri.file(path.join(basePackagePath, ".env.example"));
            files.push({
                path: envUri,
                content: generateEnvExample(),
            });
        }
        await (0, fileUtils_1.createFilesInWorkspace)(files);
        const folderCount = foldersToCreate.length;
        (0, validation_1.showInfoMessage)(`✅ Project structure created successfully! Created ${folderCount} folders with recommended Spring Boot organization.`);
    }
    catch (error) {
        (0, validation_1.showErrorMessage)(`Error creating project structure: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.createProjectStructure = createProjectStructure;
/**
 * Gets project structure configuration from user
 */
const getProjectStructureConfig = async () => {
    const projectName = await (0, validation_1.getProjectName)();
    if (!(0, validation_1.isValidInput)(projectName)) {
        return null;
    }
    const selectedFeatures = await (0, validation_1.showQuickPick)([
        { label: "Include Test Folder", picked: true },
        { label: "Include README.md", picked: true },
        { label: "Include .env.example", picked: true },
    ], "Select optional features", true);
    return {
        projectName: projectName,
        includeTest: selectedFeatures?.some((f) => f.label === "Include Test Folder") ?? true,
        includeReadme: selectedFeatures?.some((f) => f.label === "Include README.md") ?? true,
        includeEnvExample: selectedFeatures?.some((f) => f.label === "Include .env.example") ?? true,
    };
};
/**
 * Generates project README content
 */
const generateProjectReadme = (projectName) => {
    return `# ${projectName}

A Spring Boot application with clean architecture and modular design.

## Project Structure

\`\`\`
src/main/java/com/example/${projectName.toLowerCase()}/
├── controller/      # REST endpoints and request handlers
├── service/         # Business logic and service layer
├── repository/      # Data access layer (JPA repositories)
├── entity/          # JPA entity classes
├── dto/             # Data transfer objects
├── mapper/          # Entity to DTO converters
├── exception/       # Custom exceptions and handlers
├── config/          # Spring configuration classes
├── util/            # Utility and helper classes
└── constants/       # Application constants
\`\`\`

## Getting Started

### Prerequisites
- Java 11 or higher
- Maven 3.6+
- MySQL 8.0+

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Create a database: \`CREATE DATABASE ${projectName.toLowerCase()};\`
4. Configure \`application.properties\` with your database details
5. Run: \`mvn clean install\`
6. Start the application: \`mvn spring-boot:run\`

### Configuration

Copy \`.env.example\` to \`.env\` and update with your configuration:

\`\`\`properties
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/${projectName.toLowerCase()}
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=
SPRING_JPA_HIBERNATE_DDL_AUTO=update
\`\`\`

## API Documentation

Once the application is running, access Swagger UI at:
\`http://localhost:8080/swagger-ui.html\`

## Built With

- Spring Boot 3.x
- Spring Data JPA
- MySQL
- Lombok
- Maven

## License

This project is licensed under the MIT License.
`;
};
/**
 * Generates .env.example file content
 */
const generateEnvExample = () => {
    return `# Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/app_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=

# JPA Configuration
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
SERVER_PORT=8080
SERVER_SERVLET_CONTEXT_PATH=/api

# Application Configuration
SPRING_APPLICATION_NAME=spring-app
SPRING_PROFILES_ACTIVE=dev

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_EXAMPLE=DEBUG

# Security (if needed)
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000
`;
};
//# sourceMappingURL=structureGenerator.js.map