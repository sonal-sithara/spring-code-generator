import * as vscode from "vscode";
import * as path from "path";
import { ProjectStructureConfig } from "../types";
import {
  resolveFolderUri,
  createFilesInWorkspace,
} from "../utils/fileUtils";
import {
  isValidInput,
  getProjectName,
  showQuickPick,
  showInfoMessage,
  showErrorMessage,
} from "../utils/validation";
import { PROJECT_FOLDERS, OPTIONAL_FOLDERS } from "../constants";

/**
 * Creates recommended Spring Boot project folder structure
 */
export const createProjectStructure = async (folder: any): Promise<void> => {
  try {
    const uri = await resolveFolderUri(folder);
    const config = await getProjectStructureConfig();

    if (!config) {
      return;
    }

    const basePackagePath = uri.path;
    const foldersToCreate = [...PROJECT_FOLDERS];

    if (config.includeTest) {
      foldersToCreate.push(...OPTIONAL_FOLDERS);
    }

    const files: Array<{ path: vscode.Uri; content: string }> = [];

    // Create folders with .gitkeep files
    foldersToCreate.forEach((folderName) => {
      const gitkeepUri = vscode.Uri.file(
        path.join(basePackagePath, folderName, ".gitkeep")
      );
      files.push({
        path: gitkeepUri,
        content: "",
      });
    });

    // Create README if selected
    if (config.includeReadme) {
      const readmeUri = vscode.Uri.file(
        path.join(basePackagePath, "README.md")
      );
      files.push({
        path: readmeUri,
        content: generateProjectReadme(config.projectName),
      });
    }

    // Create .env.example if selected
    if (config.includeEnvExample) {
      const envUri = vscode.Uri.file(
        path.join(basePackagePath, ".env.example")
      );
      files.push({
        path: envUri,
        content: generateEnvExample(),
      });
    }

    await createFilesInWorkspace(files);

    const folderCount = foldersToCreate.length;
    showInfoMessage(
      `✅ Project structure created successfully! Created ${folderCount} folders with recommended Spring Boot organization.`
    );
  } catch (error) {
    showErrorMessage(
      `Error creating project structure: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Gets project structure configuration from user
 */
const getProjectStructureConfig = async (): Promise<ProjectStructureConfig | null> => {
  const projectName = await getProjectName();

  if (!isValidInput(projectName)) {
    return null;
  }

  const selectedFeatures = await showQuickPick(
    [
      { label: "Include Test Folder", picked: true },
      { label: "Include README.md", picked: true },
      { label: "Include .env.example", picked: true },
    ],
    "Select optional features",
    true
  );

  return {
    projectName: projectName!,
    includeTest:
      selectedFeatures?.some((f) => f.label === "Include Test Folder") ?? true,
    includeReadme:
      selectedFeatures?.some((f) => f.label === "Include README.md") ?? true,
    includeEnvExample:
      selectedFeatures?.some((f) => f.label === "Include .env.example") ?? true,
  };
};

/**
 * Generates project README content
 */
const generateProjectReadme = (projectName: string): string => {
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
const generateEnvExample = (): string => {
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
