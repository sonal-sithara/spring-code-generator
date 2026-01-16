import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// Constants
const JAVA_PACKAGE_SEPARATOR = "java/";
const PACKAGE_PLACEHOLDER = "package-des";
const CLASS_NAME_PLACEHOLDER = "TempClassName";
const TEMP_MAPPING_PLACEHOLDER = "temp-mapping";
const INTERFACE_NAME_PLACEHOLDER = "interfaceName";
const ENTITY_NAME_PLACEHOLDER = "entityName";
const DATA_TYPE_PLACEHOLDER = "dataType";
const TEMPLATE_EXTENSION = ".txt";
const JAVA_EXTENSION = ".java";

// Interfaces
interface TemplateValues {
  className: string;
  packageName: string;
  entityName?: string;
  dataType?: string;
  interfaceName?: string;
}

interface RepositoryValues {
  entityName: string;
  dataType: string;
}

interface ServiceImplValues {
  interfaceName: string;
}

interface BatchModuleConfig {
  moduleName: string;
  createEntity: boolean;
  createRepository: boolean;
  createService: boolean;
  createController: boolean;
  createDto: boolean;
  createRequestDto: boolean;
  createResponseDto: boolean;
  useLombok: boolean;
  idDataType: string;
}

/**
 * Creates a batch module with multiple components
 * @param folder - The folder URI where module should be created
 */
export const createBatchModule = async (folder: any): Promise<void> => {
  try {
    const uri = await resolveFolderUri(folder);
    const config = await getBatchModuleConfig();

    if (!config) {
      return;
    }

    const packageName = extractPackageName(uri.path);
    const files: Array<{ path: vscode.Uri; content: string }> = [];

    // Generate Entity
    if (config.createEntity) {
      const entityContent = generateEntityTemplate(
        config.moduleName,
        packageName,
        config.useLombok,
        config.idDataType
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}.java`)
        ),
        content: entityContent,
      });
    }

    // Generate Repository
    if (config.createRepository) {
      const repoContent = generateRepositoryTemplate(
        `${config.moduleName}Repository`,
        packageName,
        config.moduleName,
        config.idDataType
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Repository.java`)
        ),
        content: repoContent,
      });
    }

    // Generate Service Interface
    if (config.createService) {
      const serviceInterfaceContent = generateServiceInterfaceTemplate(
        `${config.moduleName}Service`,
        packageName
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Service.java`)
        ),
        content: serviceInterfaceContent,
      });

      // Generate Service Implementation
      const serviceImplContent = generateServiceImplTemplate(
        `${config.moduleName}ServiceImpl`,
        packageName,
        `${config.moduleName}Service`
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}ServiceImpl.java`)
        ),
        content: serviceImplContent,
      });
    }

    // Generate Controller
    if (config.createController) {
      const controllerContent = generateControllerTemplate(
        `${config.moduleName}Controller`,
        packageName,
        config.moduleName
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Controller.java`)
        ),
        content: controllerContent,
      });
    }

    // Generate DTO
    if (config.createDto) {
      const dtoContent = generateDtoTemplate(
        `${config.moduleName}DTO`,
        packageName,
        config.useLombok
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}DTO.java`)
        ),
        content: dtoContent,
      });
    }

    // Generate Request DTO
    if (config.createRequestDto) {
      const requestDtoContent = generateTemplateWithPlaceholders(
        "request-dto",
        `${config.moduleName}Request`,
        packageName
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Request.java`)
        ),
        content: requestDtoContent,
      });
    }

    // Generate Response DTO
    if (config.createResponseDto) {
      const responseDtoContent = generateTemplateWithPlaceholders(
        "response-dto",
        `${config.moduleName}Response`,
        packageName
      );
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Response.java`)
        ),
        content: responseDtoContent,
      });
    }

    // Create all files
    const workspaceEdit = new vscode.WorkspaceEdit();
    files.forEach((file) => {
      workspaceEdit.createFile(file.path, { ignoreIfExists: true });
      workspaceEdit.insert(file.path, new vscode.Position(0, 0), file.content);
    });

    await vscode.workspace.applyEdit(workspaceEdit);
    vscode.window.showInformationMessage(
      `✅ Module "${config.moduleName}" created successfully with ${files.length} files!`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error creating batch module: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Gets batch module configuration from user
 */
const getBatchModuleConfig = async (): Promise<BatchModuleConfig | null> => {
  // Get module name
  const moduleName = await vscode.window.showInputBox({
    placeHolder: "Enter module name (e.g., User, Product, Order)",
    validateInput: (value) =>
      !isValidInput(value) ? "Module name cannot be empty" : "",
  });

  if (!isValidInput(moduleName)) {
    return null;
  }

  // Get ID data type
  const idDataType = await vscode.window.showInputBox({
    placeHolder: "Enter ID data type (e.g., Long, Integer, String)",
    value: "Long",
    validateInput: (value) =>
      !isValidInput(value) ? "Data type cannot be empty" : "",
  });

  if (!isValidInput(idDataType)) {
    return null;
  }

  // Select components to generate
  const selectedItems = await vscode.window.showQuickPick(
    [
      { label: "Entity", picked: true },
      { label: "Repository", picked: true },
      { label: "Service Interface & Implementation", picked: true },
      { label: "Controller", picked: true },
      { label: "DTO", picked: true },
      { label: "Request DTO", picked: false },
      { label: "Response DTO", picked: false },
    ],
    { canPickMany: true, placeHolder: "Select components to generate" }
  );

  if (!selectedItems || selectedItems.length === 0) {
    vscode.window.showWarningMessage("Please select at least one component");
    return null;
  }

  // Ask about Lombok
  const useLombok = await vscode.window.showQuickPick(
    [
      { label: "Yes (with Lombok)", description: "Cleaner code with annotations" },
      { label: "No", description: "Standard Java with getters/setters" },
    ],
    { placeHolder: "Use Lombok annotations?" }
  );

  return {
    moduleName: moduleName!,
    createEntity: selectedItems.some((i) => i.label === "Entity"),
    createRepository: selectedItems.some((i) => i.label === "Repository"),
    createService: selectedItems.some(
      (i) => i.label === "Service Interface & Implementation"
    ),
    createController: selectedItems.some((i) => i.label === "Controller"),
    createDto: selectedItems.some((i) => i.label === "DTO"),
    createRequestDto: selectedItems.some((i) => i.label === "Request DTO"),
    createResponseDto: selectedItems.some((i) => i.label === "Response DTO"),
    useLombok: useLombok?.label === "Yes (with Lombok)",
    idDataType: idDataType!,
  };
};

/**
 * Generates entity template content
 */
const generateEntityTemplate = (
  moduleName: string,
  packageName: string,
  useLombok: boolean,
  idDataType: string
): string => {
  const lombokAnnotations = useLombok
    ? "@Data\n@NoArgsConstructor\n@AllArgsConstructor\n"
    : "";
  const lombokImports = useLombok
    ? "import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n"
    : "";

  return `package ${packageName};

import javax.persistence.*;
${lombokImports}

@Entity
@Table(name = "${moduleName.toLowerCase()}s")
${lombokAnnotations}
public class ${moduleName} {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private ${idDataType} id;
    
    // Add your properties here
}
`;
};

/**
 * Generates repository template content
 */
const generateRepositoryTemplate = (
  repositoryName: string,
  packageName: string,
  entityName: string,
  idDataType: string
): string => {
  return `package ${packageName};

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${repositoryName} extends JpaRepository<${entityName}, ${idDataType}> {
    
    // Add custom queries here
}
`;
};

/**
 * Generates service interface template
 */
const generateServiceInterfaceTemplate = (
  serviceName: string,
  packageName: string
): string => {
  return `package ${packageName};

public interface ${serviceName} {
    
    // Define your service methods here
}
`;
};

/**
 * Generates service implementation template
 */
const generateServiceImplTemplate = (
  serviceName: string,
  packageName: string,
  interfaceName: string
): string => {
  return `package ${packageName};

import org.springframework.stereotype.Service;
import javax.transaction.Transactional;

@Service
@Transactional
public class ${serviceName} implements ${interfaceName} {
    
    @Override
    public void method() {
        // Implementation
    }
}
`;
};

/**
 * Generates controller template
 */
const generateControllerTemplate = (
  controllerName: string,
  packageName: string,
  moduleName: string
): string => {
  const mapping = moduleName.toLowerCase();
  return `package ${packageName};

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/${mapping}")
public class ${controllerName} {
    
    // Inject your service here
    
    @GetMapping
    public Object getAll() {
        // Implementation
        return null;
    }
    
    @GetMapping("/{id}")
    public Object getById(@PathVariable Long id) {
        // Implementation
        return null;
    }
    
    @PostMapping
    public Object create(@RequestBody Object request) {
        // Implementation
        return null;
    }
    
    @PutMapping("/{id}")
    public Object update(@PathVariable Long id, @RequestBody Object request) {
        // Implementation
        return null;
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        // Implementation
    }
}
`;
};

/**
 * Generates DTO template
 */
const generateDtoTemplate = (
  dtoName: string,
  packageName: string,
  useLombok: boolean
): string => {
  const lombokAnnotations = useLombok
    ? "@Data\n@NoArgsConstructor\n@AllArgsConstructor\n"
    : "";
  const lombokImports = useLombok
    ? "import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n"
    : "";

  return `package ${packageName};

${lombokImports}
${lombokAnnotations}
public class ${dtoName} {
    
    private Long id;
    
    // Add your properties here
}
`;
};

/**
 * Helper to generate template with placeholders
 */
const generateTemplateWithPlaceholders = (
  templateType: string,
  className: string,
  packageName: string
): string => {
  const templatePath = path.join(
    __dirname,
    "template",
    `${templateType}${TEMPLATE_EXTENSION}`
  );
  let content = fs.readFileSync(templatePath, "utf-8");

  content = content
    .replace(PACKAGE_PLACEHOLDER, packageName)
    .replace(CLASS_NAME_PLACEHOLDER, className);

  return content;
};


/**
 * Main function to create a file based on template type
 * @param folder - The folder URI where file should be created
 * @param type - The template type (e.g., "controller", "entity")
 */
export const createFile = async (folder: any, type: string): Promise<void> => {
  try {
    const uri = await resolveFolderUri(folder);
    const className = await getClassName();

    if (!isValidInput(className)) {
      vscode.window.showWarningMessage("Please enter a valid class name");
      return;
    }

    const templateValues = await getTemplateValues(type, className);
    await generateFile(uri, type, templateValues);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error creating file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Resolves the folder URI, using clipboard if not provided
 */
const resolveFolderUri = async (folder: any): Promise<vscode.Uri> => {
  if (folder) {
    return folder;
  }

  await vscode.commands.executeCommand("copyFilePath");
  const folderPath = await vscode.env.clipboard.readText();
  return vscode.Uri.file(folderPath);
};

/**
 * Gets class name input from user
 */
const getClassName = async (): Promise<string> => {
  const input = await vscode.window.showInputBox({
    placeHolder: "Enter class name",
    validateInput: (value) =>
      !isValidInput(value) ? "Class name cannot be empty" : "",
  });
  return input || "";
};

/**
 * Validates if input is not empty or null
 */
const isValidInput = (input: string | undefined): boolean => {
  return input !== undefined && input !== null && input.trim().length > 0;
};

/**
 * Gets template-specific values based on template type
 */
const getTemplateValues = async (
  type: string,
  className: string
): Promise<TemplateValues> => {
  const baseValues: TemplateValues = { className, packageName: "" };

  if (type === "repository") {
    const repoValues = await getRepositoryValues();
    return { ...baseValues, ...repoValues };
  } else if (type === "service-impl") {
    const serviceValues = await getServiceImplValues();
    return { ...baseValues, ...serviceValues };
  }

  return baseValues;
};

/**
 * Generates and creates the Java file
 */
const generateFile = async (
  uri: vscode.Uri,
  type: string,
  values: TemplateValues
): Promise<void> => {
  const packageName = extractPackageName(uri.path);
  const templateContent = readTemplate(type);
  const fileContent = replaceTemplateVariables(templateContent, {
    ...values,
    packageName,
  });

  const filePath = vscode.Uri.file(
    path.join(uri.path, `${values.className}${JAVA_EXTENSION}`)
  );

  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.createFile(filePath, { ignoreIfExists: true });
  workspaceEdit.insert(filePath, new vscode.Position(0, 0), fileContent);

  await vscode.workspace.applyEdit(workspaceEdit);
  vscode.window.showInformationMessage(`Created file: ${values.className}`);
};

/**
 * Extracts package name from file path
 */
const extractPackageName = (folderPath: string): string => {
  const parts = folderPath.split(JAVA_PACKAGE_SEPARATOR);
  if (parts.length <= 1) {
    return "";
  }
  return parts[1].replaceAll("/", ".");
};

/**
 * Reads template file content
 */
const readTemplate = (type: string): string => {
  const templatePath = path.join(
    __dirname,
    "template",
    `${type}${TEMPLATE_EXTENSION}`
  );
  return fs.readFileSync(templatePath, "utf-8");
};

/**
 * Replaces template variables with actual values
 */
const replaceTemplateVariables = (
  content: string,
  values: TemplateValues
): string => {
  let result = content;

  result = result.replace(PACKAGE_PLACEHOLDER, values.packageName);
  result = result.replace(CLASS_NAME_PLACEHOLDER, values.className);
  result = result.replaceAll(TEMP_MAPPING_PLACEHOLDER, values.className.toLowerCase());

  if (values.entityName) {
    result = result.replace(ENTITY_NAME_PLACEHOLDER, values.entityName);
  }

  if (values.dataType) {
    result = result.replace(DATA_TYPE_PLACEHOLDER, values.dataType);
  }

  if (values.interfaceName) {
    result = result.replace(INTERFACE_NAME_PLACEHOLDER, values.interfaceName);
  }

  return result;
};

/**
 * Gets repository-specific values (entity name and data type)
 */
const getRepositoryValues = async (): Promise<RepositoryValues> => {
  const entityName = await vscode.window.showInputBox({
    placeHolder: "Enter entity name",
    validateInput: (value) =>
      !isValidInput(value) ? "Entity name cannot be empty" : "",
  });

  if (!isValidInput(entityName)) {
    throw new Error("Entity name is required");
  }

  const dataType = await vscode.window.showInputBox({
    placeHolder: "Enter ID data type (e.g., Integer, Long)",
    validateInput: (value) =>
      !isValidInput(value) ? "Data type cannot be empty" : "",
  });

  if (!isValidInput(dataType)) {
    throw new Error("Data type is required");
  }

  return { entityName: entityName!, dataType: dataType! };
};

/**
 * Creates recommended Spring Boot project folder structure
 * @param folder - The folder URI where structure should be created
 */
export const createProjectStructure = async (folder: any): Promise<void> => {
  try {
    const uri = await resolveFolderUri(folder);
    const config = await getProjectStructureConfig();

    if (!config) {
      return;
    }

    const packagePath = extractPackageName(uri.path);
    const basePackagePath = uri.path;

    // Define folder structure
    const folders = [
      "controller",
      "service",
      "repository",
      "entity",
      "dto",
      "mapper",
      "exception",
      "config",
      "util",
      "constants",
    ];

    if (config.includeTest) {
      folders.push("test");
    }

    // Create all folders
    const workspaceEdit = new vscode.WorkspaceEdit();

    folders.forEach((folder) => {
      const folderUri = vscode.Uri.file(path.join(basePackagePath, folder));
      workspaceEdit.createFile(folderUri, { ignoreIfExists: true });

      // Create a .gitkeep file to ensure folder is tracked by git
      const gitkeepUri = vscode.Uri.file(
        path.join(basePackagePath, folder, ".gitkeep")
      );
      workspaceEdit.createFile(gitkeepUri, { ignoreIfExists: true });
      workspaceEdit.insert(gitkeepUri, new vscode.Position(0, 0), "");
    });

    // Create README in project root if selected
    if (config.includeReadme) {
      const readmeUri = vscode.Uri.file(path.join(basePackagePath, "README.md"));
      const readmeContent = generateProjectReadme(config.projectName);
      workspaceEdit.createFile(readmeUri, { ignoreIfExists: true });
      workspaceEdit.insert(readmeUri, new vscode.Position(0, 0), readmeContent);
    }

    // Create .env.example if selected
    if (config.includeEnvExample) {
      const envUri = vscode.Uri.file(
        path.join(basePackagePath, ".env.example")
      );
      const envContent = generateEnvExample();
      workspaceEdit.createFile(envUri, { ignoreIfExists: true });
      workspaceEdit.insert(envUri, new vscode.Position(0, 0), envContent);
    }

    await vscode.workspace.applyEdit(workspaceEdit);

    const folderCount = folders.length;
    vscode.window.showInformationMessage(
      `✅ Project structure created successfully! Created ${folderCount} folders with recommended Spring Boot organization.`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error creating project structure: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Gets project structure configuration from user
 */
const getProjectStructureConfig = async (): Promise<{
  projectName: string;
  includeTest: boolean;
  includeReadme: boolean;
  includeEnvExample: boolean;
} | null> => {
  // Get project name
  const projectName = await vscode.window.showInputBox({
    placeHolder: "Enter project name (e.g., MySpringApp)",
    validateInput: (value) =>
      !isValidInput(value) ? "Project name cannot be empty" : "",
  });

  if (!isValidInput(projectName)) {
    return null;
  }

  // Select optional features
  const selectedFeatures = await vscode.window.showQuickPick(
    [
      { label: "Include Test Folder", picked: true },
      { label: "Include README.md", picked: true },
      { label: "Include .env.example", picked: true },
    ],
    { canPickMany: true, placeHolder: "Select optional features" }
  );

  return {
    projectName: projectName!,
    includeTest: selectedFeatures?.some((f) => f.label === "Include Test Folder") ?? true,
    includeReadme: selectedFeatures?.some((f) => f.label === "Include README.md") ?? true,
    includeEnvExample: selectedFeatures?.some((f) => f.label === "Include .env.example") ?? true,
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


/**
 * Gets service implementation-specific values (interface name)
 */
const getServiceImplValues = async (): Promise<ServiceImplValues> => {
  const interfaceName = await vscode.window.showInputBox({
    placeHolder: "Enter interface name (e.g., UserService)",
    validateInput: (value) =>
      !isValidInput(value) ? "Interface name cannot be empty" : "",
  });

  if (!isValidInput(interfaceName)) {
    throw new Error("Interface name is required");
  }

  return { interfaceName: interfaceName! };
};

