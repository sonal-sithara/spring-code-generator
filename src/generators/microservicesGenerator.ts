import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { extractPackageName } from "../utils/fileUtils";

export interface MicroserviceComponentConfig {
  componentType: "FeignClient" | "ServiceDiscovery" | "ConfigClient" | "CircuitBreaker" | "ApiGateway";
  serviceName?: string;
  serviceUrl?: string;
  fallbackClass?: string;
}

export async function createMicroserviceComponent(uri: vscode.Uri | undefined) {
  try {
    const folderPath = uri ? uri.fsPath : undefined;
    
    if (!folderPath) {
      vscode.window.showErrorMessage("Please select a folder first!");
      return;
    }

    // Select component type
    const componentType = await vscode.window.showQuickPick(
      [
        { label: "FeignClient", description: "REST client for inter-service communication" },
        { label: "ServiceDiscovery", description: "Eureka server configuration" },
        { label: "ConfigClient", description: "Spring Cloud Config client setup" },
        { label: "CircuitBreaker", description: "Resilience4j circuit breaker" },
        { label: "ApiGateway", description: "Spring Cloud Gateway configuration" },
      ],
      {
        placeHolder: "Select microservice component type",
        ignoreFocusOut: true,
      }
    );

    if (!componentType) {
      return;
    }

    const config: MicroserviceComponentConfig = {
      componentType: componentType.label as any,
    };

    // Get additional info based on component type
    if (componentType.label === "FeignClient") {
      config.serviceName = await vscode.window.showInputBox({
        prompt: "Enter service name (target microservice)",
        placeHolder: "user-service, product-service",
        ignoreFocusOut: true,
      });

      config.serviceUrl = await vscode.window.showInputBox({
        prompt: "Enter service URL (optional, for direct URL)",
        placeHolder: "http://localhost:8081",
        ignoreFocusOut: true,
      });

      const includeFallback = await vscode.window.showQuickPick(
        ["No", "Yes"],
        {
          placeHolder: "Include fallback class for circuit breaker?",
          ignoreFocusOut: true,
        }
      );

      if (includeFallback === "Yes") {
        config.fallbackClass = `${config.serviceName}Fallback`;
      }
    }

    // Generate component
    const files = generateMicroserviceComponent(config, folderPath);
    
    // Write files
    for (const file of files) {
      const filePath = path.join(folderPath, file.name);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, file.content);
    }

    // Open first file
    if (files.length > 0) {
      const firstFilePath = path.join(folderPath, files[0].name);
      const document = await vscode.workspace.openTextDocument(firstFilePath);
      await vscode.window.showTextDocument(document);
    }

    vscode.window.showInformationMessage(
      `✅ ${componentType.label} component created with ${files.length} file(s)!`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to create microservice component: ${error.message}`
    );
  }
}

interface GeneratedFile {
  name: string;
  content: string;
}

function generateMicroserviceComponent(
  config: MicroserviceComponentConfig,
  folderPath: string
): GeneratedFile[] {
  switch (config.componentType) {
    case "FeignClient":
      return generateFeignClient(config, folderPath);
    case "ServiceDiscovery":
      return generateServiceDiscovery(folderPath);
    case "ConfigClient":
      return generateConfigClient(folderPath);
    case "CircuitBreaker":
      return generateCircuitBreaker(config, folderPath);
    case "ApiGateway":
      return generateApiGateway(folderPath);
    default:
      return [];
  }
}

function generateFeignClient(
  config: MicroserviceComponentConfig,
  folderPath: string
): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const serviceName = config.serviceName || "ExampleService";
  const className = serviceName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("") + "Client";

  const files: GeneratedFile[] = [];

  // Feign Client Interface
  let clientContent = `package ${packageName};\n\n`;
  clientContent += `import org.springframework.cloud.openfeign.FeignClient;\n`;
  clientContent += `import org.springframework.web.bind.annotation.*;\n`;
  clientContent += `import java.util.List;\n\n`;

  clientContent += `/**\n`;
  clientContent += ` * Feign client for ${serviceName}\n`;
  clientContent += ` */\n`;
  
  if (config.fallbackClass) {
    clientContent += `@FeignClient(name = "${serviceName}", fallback = ${config.fallbackClass}.class`;
  } else {
    clientContent += `@FeignClient(name = "${serviceName}"`;
  }
  
  if (config.serviceUrl) {
    clientContent += `, url = "${config.serviceUrl}"`;
  }
  
  clientContent += `)\n`;
  clientContent += `public interface ${className} {\n\n`;
  clientContent += `    @GetMapping("/api/resource")\n`;
  clientContent += `    List<Object> getAllResources();\n\n`;
  clientContent += `    @GetMapping("/api/resource/{id}")\n`;
  clientContent += `    Object getResourceById(@PathVariable Long id);\n\n`;
  clientContent += `    @PostMapping("/api/resource")\n`;
  clientContent += `    Object createResource(@RequestBody Object resource);\n\n`;
  clientContent += `    @PutMapping("/api/resource/{id}")\n`;
  clientContent += `    Object updateResource(@PathVariable Long id, @RequestBody Object resource);\n\n`;
  clientContent += `    @DeleteMapping("/api/resource/{id}")\n`;
  clientContent += `    void deleteResource(@PathVariable Long id);\n`;
  clientContent += `}\n`;

  files.push({ name: `${className}.java`, content: clientContent });

  // Fallback Implementation
  if (config.fallbackClass) {
    let fallbackContent = `package ${packageName};\n\n`;
    fallbackContent += `import org.springframework.stereotype.Component;\n`;
    fallbackContent += `import java.util.List;\n`;
    fallbackContent += `import java.util.Collections;\n\n`;

    fallbackContent += `/**\n`;
    fallbackContent += ` * Fallback implementation for ${className}\n`;
    fallbackContent += ` * Provides default responses when ${serviceName} is unavailable\n`;
    fallbackContent += ` */\n`;
    fallbackContent += `@Component\n`;
    fallbackContent += `public class ${config.fallbackClass} implements ${className} {\n\n`;
    fallbackContent += `    @Override\n`;
    fallbackContent += `    public List<Object> getAllResources() {\n`;
    fallbackContent += `        return Collections.emptyList();\n`;
    fallbackContent += `    }\n\n`;
    fallbackContent += `    @Override\n`;
    fallbackContent += `    public Object getResourceById(Long id) {\n`;
    fallbackContent += `        return null;\n`;
    fallbackContent += `    }\n\n`;
    fallbackContent += `    @Override\n`;
    fallbackContent += `    public Object createResource(Object resource) {\n`;
    fallbackContent += `        return null;\n`;
    fallbackContent += `    }\n\n`;
    fallbackContent += `    @Override\n`;
    fallbackContent += `    public Object updateResource(Long id, Object resource) {\n`;
    fallbackContent += `        return null;\n`;
    fallbackContent += `    }\n\n`;
    fallbackContent += `    @Override\n`;
    fallbackContent += `    public void deleteResource(Long id) {\n`;
    fallbackContent += `        // Do nothing\n`;
    fallbackContent += `    }\n`;
    fallbackContent += `}\n`;

    files.push({ name: `${config.fallbackClass}.java`, content: fallbackContent });
  }

  // Configuration class
  let configContent = `package ${packageName};\n\n`;
  configContent += `import org.springframework.cloud.openfeign.EnableFeignClients;\n`;
  configContent += `import org.springframework.context.annotation.Configuration;\n\n`;

  configContent += `/**\n`;
  configContent += ` * Feign Client Configuration\n`;
  configContent += ` * Add this annotation to your main application class or a configuration class\n`;
  configContent += ` */\n`;
  configContent += `@Configuration\n`;
  configContent += `@EnableFeignClients\n`;
  configContent += `public class FeignClientConfig {\n`;
  configContent += `    // Additional Feign configuration can be added here\n`;
  configContent += `}\n`;

  files.push({ name: "FeignClientConfig.java", content: configContent });

  return files;
}

function generateServiceDiscovery(folderPath: string): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const files: GeneratedFile[] = [];

  // Eureka Server Configuration
  let content = `package ${packageName};\n\n`;
  content += `import org.springframework.boot.SpringApplication;\n`;
  content += `import org.springframework.boot.autoconfigure.SpringBootApplication;\n`;
  content += `import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;\n\n`;

  content += `/**\n`;
  content += ` * Eureka Service Discovery Server\n`;
  content += ` * \n`;
  content += ` * Required dependencies in pom.xml:\n`;
  content += ` * <dependency>\n`;
  content += ` *     <groupId>org.springframework.cloud</groupId>\n`;
  content += ` *     <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>\n`;
  content += ` * </dependency>\n`;
  content += ` * \n`;
  content += ` * Required properties in application.yml:\n`;
  content += ` * server:\n`;
  content += ` *   port: 8761\n`;
  content += ` * eureka:\n`;
  content += ` *   client:\n`;
  content += ` *     register-with-eureka: false\n`;
  content += ` *     fetch-registry: false\n`;
  content += ` */\n`;
  content += `@SpringBootApplication\n`;
  content += `@EnableEurekaServer\n`;
  content += `public class EurekaServerApplication {\n\n`;
  content += `    public static void main(String[] args) {\n`;
  content += `        SpringApplication.run(EurekaServerApplication.class, args);\n`;
  content += `    }\n`;
  content += `}\n`;

  files.push({ name: "EurekaServerApplication.java", content });

  // application.yml template
  let ymlContent = `# Eureka Server Configuration\n`;
  ymlContent += `server:\n`;
  ymlContent += `  port: 8761\n\n`;
  ymlContent += `spring:\n`;
  ymlContent += `  application:\n`;
  ymlContent += `    name: eureka-server\n\n`;
  ymlContent += `eureka:\n`;
  ymlContent += `  client:\n`;
  ymlContent += `    register-with-eureka: false\n`;
  ymlContent += `    fetch-registry: false\n`;
  ymlContent += `    service-url:\n`;
  ymlContent += `      defaultZone: http://localhost:8761/eureka/\n`;
  ymlContent += `  server:\n`;
  ymlContent += `    enable-self-preservation: false\n`;

  files.push({ name: "application-eureka.yml", content: ymlContent });

  return files;
}

function generateConfigClient(folderPath: string): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const files: GeneratedFile[] = [];

  // Config Client Setup
  let content = `package ${packageName};\n\n`;
  content += `import org.springframework.beans.factory.annotation.Value;\n`;
  content += `import org.springframework.cloud.context.config.annotation.RefreshScope;\n`;
  content += `import org.springframework.context.annotation.Configuration;\n\n`;

  content += `/**\n`;
  content += ` * Spring Cloud Config Client Configuration\n`;
  content += ` * \n`;
  content += ` * Required dependencies in pom.xml:\n`;
  content += ` * <dependency>\n`;
  content += ` *     <groupId>org.springframework.cloud</groupId>\n`;
  content += ` *     <artifactId>spring-cloud-starter-config</artifactId>\n`;
  content += ` * </dependency>\n`;
  content += ` * \n`;
  content += ` * Required properties in bootstrap.yml:\n`;
  content += ` * spring:\n`;
  content += ` *   cloud:\n`;
  content += ` *     config:\n`;
  content += ` *       uri: http://localhost:8888\n`;
  content += ` *       fail-fast: true\n`;
  content += ` */\n`;
  content += `@Configuration\n`;
  content += `@RefreshScope\n`;
  content += `public class ConfigClientConfig {\n\n`;
  content += `    @Value("\${app.message:Default Message}")\n`;
  content += `    private String message;\n\n`;
  content += `    public String getMessage() {\n`;
  content += `        return message;\n`;
  content += `    }\n`;
  content += `}\n`;

  files.push({ name: "ConfigClientConfig.java", content });

  // bootstrap.yml template
  let ymlContent = `# Spring Cloud Config Client Configuration\n`;
  ymlContent += `spring:\n`;
  ymlContent += `  application:\n`;
  ymlContent += `    name: your-service-name\n`;
  ymlContent += `  cloud:\n`;
  ymlContent += `    config:\n`;
  ymlContent += `      uri: http://localhost:8888\n`;
  ymlContent += `      fail-fast: true\n`;
  ymlContent += `      retry:\n`;
  ymlContent += `        max-attempts: 6\n`;
  ymlContent += `        initial-interval: 1000\n`;
  ymlContent += `        multiplier: 1.1\n`;
  ymlContent += `        max-interval: 2000\n`;

  files.push({ name: "bootstrap.yml", content: ymlContent });

  return files;
}

function generateCircuitBreaker(
  config: MicroserviceComponentConfig,
  folderPath: string
): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const files: GeneratedFile[] = [];

  // Circuit Breaker Service Example
  let content = `package ${packageName};\n\n`;
  content += `import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;\n`;
  content += `import io.github.resilience4j.retry.annotation.Retry;\n`;
  content += `import io.github.resilience4j.bulkhead.annotation.Bulkhead;\n`;
  content += `import io.github.resilience4j.ratelimiter.annotation.RateLimiter;\n`;
  content += `import org.springframework.stereotype.Service;\n`;
  content += `import org.slf4j.Logger;\n`;
  content += `import org.slf4j.LoggerFactory;\n\n`;

  content += `/**\n`;
  content += ` * Service with Circuit Breaker pattern\n`;
  content += ` * \n`;
  content += ` * Required dependencies in pom.xml:\n`;
  content += ` * <dependency>\n`;
  content += ` *     <groupId>org.springframework.cloud</groupId>\n`;
  content += ` *     <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>\n`;
  content += ` * </dependency>\n`;
  content += ` */\n`;
  content += `@Service\n`;
  content += `public class ResilientService {\n\n`;
  content += `    private static final Logger logger = LoggerFactory.getLogger(ResilientService.class);\n\n`;
  
  content += `    @CircuitBreaker(name = "backendService", fallbackMethod = "fallbackMethod")\n`;
  content += `    @Retry(name = "backendService")\n`;
  content += `    @RateLimiter(name = "backendService")\n`;
  content += `    public String callExternalService() {\n`;
  content += `        logger.info("Calling external service...");\n`;
  content += `        // Call external service\n`;
  content += `        return "Success";\n`;
  content += `    }\n\n`;
  
  content += `    private String fallbackMethod(Exception e) {\n`;
  content += `        logger.error("Fallback method called due to: {}", e.getMessage());\n`;
  content += `        return "Fallback response";\n`;
  content += `    }\n`;
  content += `}\n`;

  files.push({ name: "ResilientService.java", content });

  // application.yml configuration
  let ymlContent = `# Resilience4j Configuration\n`;
  ymlContent += `resilience4j:\n`;
  ymlContent += `  circuitbreaker:\n`;
  ymlContent += `    instances:\n`;
  ymlContent += `      backendService:\n`;
  ymlContent += `        register-health-indicator: true\n`;
  ymlContent += `        sliding-window-size: 10\n`;
  ymlContent += `        minimum-number-of-calls: 5\n`;
  ymlContent += `        permitted-number-of-calls-in-half-open-state: 3\n`;
  ymlContent += `        automatic-transition-from-open-to-half-open-enabled: true\n`;
  ymlContent += `        wait-duration-in-open-state: 5s\n`;
  ymlContent += `        failure-rate-threshold: 50\n`;
  ymlContent += `        slow-call-duration-threshold: 2s\n`;
  ymlContent += `        slow-call-rate-threshold: 50\n\n`;
  ymlContent += `  retry:\n`;
  ymlContent += `    instances:\n`;
  ymlContent += `      backendService:\n`;
  ymlContent += `        max-attempts: 3\n`;
  ymlContent += `        wait-duration: 1s\n`;
  ymlContent += `        retry-exceptions:\n`;
  ymlContent += `          - java.io.IOException\n`;
  ymlContent += `          - java.util.concurrent.TimeoutException\n\n`;
  ymlContent += `  ratelimiter:\n`;
  ymlContent += `    instances:\n`;
  ymlContent += `      backendService:\n`;
  ymlContent += `        limit-for-period: 10\n`;
  ymlContent += `        limit-refresh-period: 1s\n`;
  ymlContent += `        timeout-duration: 500ms\n`;

  files.push({ name: "application-resilience.yml", content: ymlContent });

  return files;
}

function generateApiGateway(folderPath: string): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const files: GeneratedFile[] = [];

  // Gateway Configuration
  let content = `package ${packageName};\n\n`;
  content += `import org.springframework.cloud.gateway.route.RouteLocator;\n`;
  content += `import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;\n`;
  content += `import org.springframework.context.annotation.Bean;\n`;
  content += `import org.springframework.context.annotation.Configuration;\n\n`;

  content += `/**\n`;
  content += ` * Spring Cloud Gateway Configuration\n`;
  content += ` * \n`;
  content += ` * Required dependencies in pom.xml:\n`;
  content += ` * <dependency>\n`;
  content += ` *     <groupId>org.springframework.cloud</groupId>\n`;
  content += ` *     <artifactId>spring-cloud-starter-gateway</artifactId>\n`;
  content += ` * </dependency>\n`;
  content += ` */\n`;
  content += `@Configuration\n`;
  content += `public class GatewayConfig {\n\n`;
  
  content += `    @Bean\n`;
  content += `    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {\n`;
  content += `        return builder.routes()\n`;
  content += `            // User Service Route\n`;
  content += `            .route("user_service", r -> r.path("/api/users/**")\n`;
  content += `                .filters(f -> f\n`;
  content += `                    .stripPrefix(1)\n`;
  content += `                    .addRequestHeader("X-Gateway", "Spring-Cloud-Gateway"))\n`;
  content += `                .uri("lb://user-service"))\n\n`;
  content += `            // Product Service Route\n`;
  content += `            .route("product_service", r -> r.path("/api/products/**")\n`;
  content += `                .filters(f -> f.stripPrefix(1))\n`;
  content += `                .uri("lb://product-service"))\n\n`;
  content += `            // Order Service Route\n`;
  content += `            .route("order_service", r -> r.path("/api/orders/**")\n`;
  content += `                .filters(f -> f.stripPrefix(1))\n`;
  content += `                .uri("lb://order-service"))\n\n`;
  content += `            .build();\n`;
  content += `    }\n`;
  content += `}\n`;

  files.push({ name: "GatewayConfig.java", content });

  // application.yml
  let ymlContent = `# Spring Cloud Gateway Configuration\n`;
  ymlContent += `server:\n`;
  ymlContent += `  port: 8080\n\n`;
  ymlContent += `spring:\n`;
  ymlContent += `  application:\n`;
  ymlContent += `    name: api-gateway\n`;
  ymlContent += `  cloud:\n`;
  ymlContent += `    gateway:\n`;
  ymlContent += `      discovery:\n`;
  ymlContent += `        locator:\n`;
  ymlContent += `          enabled: true\n`;
  ymlContent += `          lower-case-service-id: true\n`;
  ymlContent += `      globalcors:\n`;
  ymlContent += `        cors-configurations:\n`;
  ymlContent += `          '[/**]':\n`;
  ymlContent += `            allowed-origins: "*"\n`;
  ymlContent += `            allowed-methods:\n`;
  ymlContent += `              - GET\n`;
  ymlContent += `              - POST\n`;
  ymlContent += `              - PUT\n`;
  ymlContent += `              - DELETE\n`;
  ymlContent += `            allowed-headers: "*"\n\n`;
  ymlContent += `eureka:\n`;
  ymlContent += `  client:\n`;
  ymlContent += `    service-url:\n`;
  ymlContent += `      defaultZone: http://localhost:8761/eureka/\n`;

  files.push({ name: "application-gateway.yml", content: ymlContent });

  return files;
}
