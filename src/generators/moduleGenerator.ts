import * as vscode from "vscode";
import * as path from "path";
import { BatchModuleConfig } from "../types";
import {
  resolveFolderUri,
  extractPackageName,
  readTemplate,
  createFilesInWorkspace,
} from "../utils/fileUtils";
import {
  isValidInput,
  getModuleName,
  getDataType,
  showQuickPick,
  showInfoMessage,
  showErrorMessage,
} from "../utils/validation";
import {
  PACKAGE_PLACEHOLDER,
  CLASS_NAME_PLACEHOLDER,
  JAVA_EXTENSION,
} from "../constants";

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
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}.java`)
        ),
        content: generateEntityTemplate(
          config.moduleName,
          packageName,
          config.useLombok,
          config.idDataType
        ),
      });
    }

    // Generate Repository
    if (config.createRepository) {
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Repository.java`)
        ),
        content: generateRepositoryTemplate(
          `${config.moduleName}Repository`,
          packageName,
          config.moduleName,
          config.idDataType
        ),
      });
    }

    // Generate Service Interface & Implementation
    if (config.createService) {
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Service.java`)
        ),
        content: generateServiceInterfaceTemplate(
          `${config.moduleName}Service`,
          packageName
        ),
      });

      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}ServiceImpl.java`)
        ),
        content: generateServiceImplTemplate(
          `${config.moduleName}ServiceImpl`,
          packageName,
          `${config.moduleName}Service`
        ),
      });
    }

    // Generate Controller
    if (config.createController) {
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Controller.java`)
        ),
        content: generateControllerTemplate(
          `${config.moduleName}Controller`,
          packageName,
          config.moduleName
        ),
      });
    }

    // Generate DTO
    if (config.createDto) {
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}DTO.java`)
        ),
        content: generateDtoTemplate(
          `${config.moduleName}DTO`,
          packageName,
          config.useLombok
        ),
      });
    }

    // Generate Request DTO
    if (config.createRequestDto) {
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Request.java`)
        ),
        content: generateTemplateWithPlaceholders(
          "request-dto",
          `${config.moduleName}Request`,
          packageName
        ),
      });
    }

    // Generate Response DTO
    if (config.createResponseDto) {
      files.push({
        path: vscode.Uri.file(
          path.join(uri.path, `${config.moduleName}Response.java`)
        ),
        content: generateTemplateWithPlaceholders(
          "response-dto",
          `${config.moduleName}Response`,
          packageName
        ),
      });
    }

    await createFilesInWorkspace(files);
    showInfoMessage(
      `✅ Module "${config.moduleName}" created successfully with ${files.length} files!`
    );
  } catch (error) {
    showErrorMessage(
      `Error creating batch module: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Gets batch module configuration from user
 */
const getBatchModuleConfig = async (): Promise<BatchModuleConfig | null> => {
  const moduleName = await getModuleName();
  if (!isValidInput(moduleName)) {
    return null;
  }

  const idDataType = await getDataType("Long");
  if (!isValidInput(idDataType)) {
    return null;
  }

  const selectedItems = await showQuickPick(
    [
      { label: "Entity", picked: true },
      { label: "Repository", picked: true },
      { label: "Service Interface & Implementation", picked: true },
      { label: "Controller", picked: true },
      { label: "DTO", picked: true },
      { label: "Request DTO", picked: false },
      { label: "Response DTO", picked: false },
    ],
    "Select components to generate",
    true
  );

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  const useLombokSelection = await showQuickPick(
    [
      { label: "Yes (with Lombok)", description: "Cleaner code with annotations" },
      { label: "No", description: "Standard Java with getters/setters" },
    ],
    "Use Lombok annotations?"
  );

  const useLombok = useLombokSelection?.[0]?.label === "Yes (with Lombok)";

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
    useLombok,
    idDataType: idDataType!,
  };
};

/**
 * Template generation functions
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

const generateTemplateWithPlaceholders = (
  templateType: string,
  className: string,
  packageName: string
): string => {
  let content = readTemplate(templateType);

  content = content
    .replace(PACKAGE_PLACEHOLDER, packageName)
    .replace(CLASS_NAME_PLACEHOLDER, className);

  return content;
};
