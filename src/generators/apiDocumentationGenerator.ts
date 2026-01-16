import * as vscode from "vscode";
import { getProjectName, showYesNoChoice } from "../utils/validation";
import { ApiDocumentationConfig } from "../types";

/**
 * API Documentation Generator - Create Swagger/OpenAPI configuration
 * Generates configuration for API documentation with Spring Doc OpenAPI
 */
export async function createApiDocumentation(): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    // Get project information
    const projectName = await getProjectName();
    if (!projectName) {
      return;
    }

    const projectDescription = await vscode.window.showInputBox({
      placeHolder: "Enter project description (optional)",
      value: `API for ${projectName}`,
    });

    const includeSecurityScheme = await showYesNoChoice(
      "Include JWT Security Scheme?"
    );

    const config: ApiDocumentationConfig = {
      projectName,
      projectDescription: projectDescription || `API for ${projectName}`,
      includeSecurityScheme,
    };

    // Generate documentation files
    await generateApiDocumentationFiles(workspaceFolder, config);

    vscode.window.showInformationMessage(
      `✓ API Documentation configuration created for ${projectName}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error creating API documentation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate API documentation files
 */
async function generateApiDocumentationFiles(
  workspaceFolder: vscode.WorkspaceFolder,
  config: ApiDocumentationConfig
): Promise<void> {
  // Generate OpenAPI Configuration file
  const configContent = generateOpenApiConfig(config);
  const configUri = vscode.Uri.joinPath(
    workspaceFolder.uri,
    "src",
    "main",
    "java",
    "config",
    "OpenApiConfig.java"
  );

  // Create config folder if needed
  const configFolderUri = vscode.Uri.joinPath(
    workspaceFolder.uri,
    "src",
    "main",
    "java",
    "config"
  );
  try {
    await vscode.workspace.fs.stat(configFolderUri);
  } catch {
    await vscode.workspace.fs.createDirectory(configFolderUri);
  }

  await vscode.workspace.fs.writeFile(configUri, Buffer.from(configContent));

  // Generate Maven dependency file (pom.xml snippet)
  const pomContent = generatePomDependencies();
  const pomUri = vscode.Uri.joinPath(
    workspaceFolder.uri,
    "SPRINGDOC_OPENAPI_DEPENDENCIES.txt"
  );
  await vscode.workspace.fs.writeFile(pomUri, Buffer.from(pomContent));

  // Generate application.yml configuration
  const applicationYmlContent = generateApplicationYmlConfig();
  const applicationYmlUri = vscode.Uri.joinPath(
    workspaceFolder.uri,
    "src",
    "main",
    "resources",
    "swagger-config.yml"
  );

  // Create resources folder if needed
  const resourcesFolderUri = vscode.Uri.joinPath(
    workspaceFolder.uri,
    "src",
    "main",
    "resources"
  );
  try {
    await vscode.workspace.fs.stat(resourcesFolderUri);
  } catch {
    await vscode.workspace.fs.createDirectory(resourcesFolderUri);
  }

  await vscode.workspace.fs.writeFile(
    applicationYmlUri,
    Buffer.from(applicationYmlContent)
  );
}

/**
 * Generate OpenAPI Configuration class
 */
function generateOpenApiConfig(config: ApiDocumentationConfig): string {
  const securityScheme = config.includeSecurityScheme
    ? `
    @Bean
    public SecurityScheme securityScheme() {
        return new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .description("JWT token for authentication");
    }

    @Bean
    public SecurityRequirement securityRequirement() {
        return new SecurityRequirement().addList("Bearer Authentication");
    }`
    : "";

  return `package config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger 3.0) Configuration
 * Configures API documentation using Spring Doc OpenAPI
 * 
 * Add dependency to pom.xml:
 * <dependency>
 *     <groupId>org.springdoc</groupId>
 *     <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
 *     <version>2.0.4</version>
 * </dependency>
 * 
 * Swagger UI will be available at: http://localhost:8080/swagger-ui.html
 * OpenAPI JSON will be available at: http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Value("\${app.version:1.0.0}")
    private String appVersion;

    /**
     * Configure OpenAPI bean
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("${config.projectName} API")
                .version(appVersion)
                .description("${config.projectDescription}")
                .contact(new Contact()
                    .name("Support Team")
                    .url("https://example.com")
                    .email("support@example.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
${securityScheme}
}
`;
}

/**
 * Generate Maven dependencies
 */
function generatePomDependencies(): string {
  return `# SpringDoc OpenAPI Dependencies for pom.xml

Add the following dependency to your pom.xml <dependencies> section:

<!-- SpringDoc OpenAPI (Swagger 3.0 / OpenAPI 3.0) -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.4</version>
</dependency>

# For Spring Boot 2.x (older version):
<!-- 
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.7.0</version>
</dependency>
-->

# If you need Spring Security integration:
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-security</artifactId>
    <version>1.7.0</version>
</dependency>

After adding the dependency:
1. Run: mvn clean install
2. Start your Spring Boot application
3. Access Swagger UI at: http://localhost:8080/swagger-ui.html
4. Access OpenAPI JSON at: http://localhost:8080/v3/api-docs
5. Access OpenAPI YAML at: http://localhost:8080/v3/api-docs.yaml
`;
}

/**
 * Generate application.yml configuration
 */
function generateApplicationYmlConfig(): string {
  return `# SpringDoc OpenAPI Configuration

springdoc:
  # Swagger UI configuration
  swagger-ui:
    # Enable Swagger UI (default: true)
    enabled: true
    # Set path for Swagger UI
    path: /swagger-ui.html
    # Enable operations sort
    operations-sorter: method
    # Enable tags sort
    tags-sorter: alpha
    # Display request headers
    display-request-duration: true
    # Persist authorization data
    persist-authorization: true
    # URL to CSS theme
    # configUrl: https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css

  # OpenAPI Documentation configuration
  api-docs:
    # Set path for OpenAPI JSON documentation
    path: /v3/api-docs
    # Enable OpenAPI JSON documentation
    enabled: true

  # Server configuration
  swagger-ui:
    servers:
      - url: http://localhost:8080
        description: Local Development
      - url: https://api.example.com
        description: Production

  # Custom documentation properties
  show-actuator: false
  cache:
    disabled: true

  # Group documentation endpoints
  group-configs:
    - group: public
      paths-to-match:
        - /api/public/**
      paths-to-exclude:
        - /api/admin/**
    - group: admin
      paths-to-match:
        - /api/admin/**

# Application version (can be referenced in OpenAPI config)
app:
  version: 1.0.0
  name: Spring Boot API
  description: API documentation for Spring Boot application
`;
}

/**
 * Generate endpoint documentation template
 */
export function generateEndpointDocumentation(
  controllerName: string,
  methodName: string,
  httpMethod: string,
  endpoint: string
): string {
  return `
// Example: Adding OpenAPI documentation to your controller method

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@${httpMethod}Mapping("${endpoint}")
@Operation(
    summary = "Brief summary of what this endpoint does",
    description = "Detailed description of the endpoint functionality"
)
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "200",
        description = "Success response",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = ResponseClass.class)
        )
    ),
    @ApiResponse(
        responseCode = "400",
        description = "Bad request"
    ),
    @ApiResponse(
        responseCode = "401",
        description = "Unauthorized"
    ),
    @ApiResponse(
        responseCode = "404",
        description = "Not found"
    ),
    @ApiResponse(
        responseCode = "500",
        description = "Internal server error"
    )
})
@SecurityRequirement(name = "Bearer Authentication")
public ResponseEntity<?> ${methodName}(
    @Parameter(description = "Parameter description")
    @PathVariable Long id
) {
    // Implementation here
    return ResponseEntity.ok("Success");
}
`;
}
