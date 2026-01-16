"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBatchModule = void 0;
const vscode = require("vscode");
const path = require("path");
const fileUtils_1 = require("../utils/fileUtils");
const validation_1 = require("../utils/validation");
const constants_1 = require("../constants");
/**
 * Creates a batch module with multiple components
 * @param folder - The folder URI where module should be created
 */
const createBatchModule = async (folder) => {
    try {
        const uri = await (0, fileUtils_1.resolveFolderUri)(folder);
        const config = await getBatchModuleConfig();
        if (!config) {
            return;
        }
        const packageName = (0, fileUtils_1.extractPackageName)(uri.path);
        const files = [];
        // Generate Entity
        if (config.createEntity) {
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}.java`)),
                content: generateEntityTemplate(config.moduleName, packageName, config.useLombok, config.idDataType),
            });
        }
        // Generate Repository
        if (config.createRepository) {
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}Repository.java`)),
                content: generateRepositoryTemplate(`${config.moduleName}Repository`, packageName, config.moduleName, config.idDataType),
            });
        }
        // Generate Service Interface & Implementation
        if (config.createService) {
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}Service.java`)),
                content: generateServiceInterfaceTemplate(`${config.moduleName}Service`, packageName),
            });
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}ServiceImpl.java`)),
                content: generateServiceImplTemplate(`${config.moduleName}ServiceImpl`, packageName, `${config.moduleName}Service`),
            });
        }
        // Generate Controller
        if (config.createController) {
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}Controller.java`)),
                content: generateControllerTemplate(`${config.moduleName}Controller`, packageName, config.moduleName),
            });
        }
        // Generate DTO
        if (config.createDto) {
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}DTO.java`)),
                content: generateDtoTemplate(`${config.moduleName}DTO`, packageName, config.useLombok),
            });
        }
        // Generate Request DTO
        if (config.createRequestDto) {
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}Request.java`)),
                content: generateTemplateWithPlaceholders("request-dto", `${config.moduleName}Request`, packageName),
            });
        }
        // Generate Response DTO
        if (config.createResponseDto) {
            files.push({
                path: vscode.Uri.file(path.join(uri.path, `${config.moduleName}Response.java`)),
                content: generateTemplateWithPlaceholders("response-dto", `${config.moduleName}Response`, packageName),
            });
        }
        await (0, fileUtils_1.createFilesInWorkspace)(files);
        (0, validation_1.showInfoMessage)(`✅ Module "${config.moduleName}" created successfully with ${files.length} files!`);
    }
    catch (error) {
        (0, validation_1.showErrorMessage)(`Error creating batch module: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.createBatchModule = createBatchModule;
/**
 * Gets batch module configuration from user
 */
const getBatchModuleConfig = async () => {
    const moduleName = await (0, validation_1.getModuleName)();
    if (!(0, validation_1.isValidInput)(moduleName)) {
        return null;
    }
    const idDataType = await (0, validation_1.getDataType)("Long");
    if (!(0, validation_1.isValidInput)(idDataType)) {
        return null;
    }
    const selectedItems = await (0, validation_1.showQuickPick)([
        { label: "Entity", picked: true },
        { label: "Repository", picked: true },
        { label: "Service Interface & Implementation", picked: true },
        { label: "Controller", picked: true },
        { label: "DTO", picked: true },
        { label: "Request DTO", picked: false },
        { label: "Response DTO", picked: false },
    ], "Select components to generate", true);
    if (!selectedItems || selectedItems.length === 0) {
        return null;
    }
    const useLombokSelection = await (0, validation_1.showQuickPick)([
        { label: "Yes (with Lombok)", description: "Cleaner code with annotations" },
        { label: "No", description: "Standard Java with getters/setters" },
    ], "Use Lombok annotations?");
    const useLombok = useLombokSelection?.[0]?.label === "Yes (with Lombok)";
    return {
        moduleName: moduleName,
        createEntity: selectedItems.some((i) => i.label === "Entity"),
        createRepository: selectedItems.some((i) => i.label === "Repository"),
        createService: selectedItems.some((i) => i.label === "Service Interface & Implementation"),
        createController: selectedItems.some((i) => i.label === "Controller"),
        createDto: selectedItems.some((i) => i.label === "DTO"),
        createRequestDto: selectedItems.some((i) => i.label === "Request DTO"),
        createResponseDto: selectedItems.some((i) => i.label === "Response DTO"),
        useLombok,
        idDataType: idDataType,
    };
};
/**
 * Template generation functions
 */
const generateEntityTemplate = (moduleName, packageName, useLombok, idDataType) => {
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
const generateRepositoryTemplate = (repositoryName, packageName, entityName, idDataType) => {
    return `package ${packageName};

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${repositoryName} extends JpaRepository<${entityName}, ${idDataType}> {
    
    // Add custom queries here
}
`;
};
const generateServiceInterfaceTemplate = (serviceName, packageName) => {
    return `package ${packageName};

public interface ${serviceName} {
    
    // Define your service methods here
}
`;
};
const generateServiceImplTemplate = (serviceName, packageName, interfaceName) => {
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
const generateControllerTemplate = (controllerName, packageName, moduleName) => {
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
const generateDtoTemplate = (dtoName, packageName, useLombok) => {
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
const generateTemplateWithPlaceholders = (templateType, className, packageName) => {
    let content = (0, fileUtils_1.readTemplate)(templateType);
    content = content
        .replace(constants_1.PACKAGE_PLACEHOLDER, packageName)
        .replace(constants_1.CLASS_NAME_PLACEHOLDER, className);
    return content;
};
//# sourceMappingURL=moduleGenerator.js.map