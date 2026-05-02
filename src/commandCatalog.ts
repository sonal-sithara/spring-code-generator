export type CommandCategory =
  | "Web Layer"
  | "Data Layer"
  | "Business Layer"
  | "Configuration"
  | "Project & Structure"
  | "Advanced";

export interface CatalogEntry {
  id: string;
  title: string;
  category: CommandCategory;
}

export const CATEGORY_ORDER: CommandCategory[] = [
  "Web Layer",
  "Data Layer",
  "Business Layer",
  "Configuration",
  "Project & Structure",
  "Advanced",
];

export const COMMAND_CATALOG: CatalogEntry[] = [
  { id: "spring-code-generator.createController", title: "Create Controller", category: "Web Layer" },
  { id: "spring-code-generator.createControllerWithCrud", title: "Create Controller With Crud", category: "Web Layer" },

  { id: "spring-code-generator.createEntity", title: "Create Entity", category: "Data Layer" },
  { id: "spring-code-generator.createEntityWithLombok", title: "Create Entity With Lombok", category: "Data Layer" },
  { id: "spring-code-generator.createRelationship", title: "Create JPA Relationship", category: "Data Layer" },
  { id: "spring-code-generator.createRepository", title: "Create Repository", category: "Data Layer" },
  { id: "spring-code-generator.createDto", title: "Create DTO", category: "Data Layer" },
  { id: "spring-code-generator.createDtoWithLombok", title: "Create DTO With Lombok", category: "Data Layer" },
  { id: "spring-code-generator.createRequestDto", title: "Create Request DTO", category: "Data Layer" },
  { id: "spring-code-generator.createResponseDto", title: "Create Response DTO", category: "Data Layer" },
  { id: "spring-code-generator.createMapper", title: "Create Mapper", category: "Data Layer" },
  { id: "spring-code-generator.createConverter", title: "Create Converter", category: "Data Layer" },

  { id: "spring-code-generator.createServiceImpl", title: "Create Service Implementation", category: "Business Layer" },
  { id: "spring-code-generator.createException", title: "Create Exception", category: "Business Layer" },
  { id: "spring-code-generator.createGlobalExceptionHandler", title: "Create Global Exception Handler", category: "Business Layer" },

  { id: "spring-code-generator.createApplicationProperties", title: "Create application.properties", category: "Configuration" },
  { id: "spring-code-generator.createApplicationYml", title: "Create application.yml", category: "Configuration" },
  { id: "spring-code-generator.createConfiguration", title: "Create Configuration Templates", category: "Configuration" },
  { id: "spring-code-generator.createSecurityConfig", title: "Create Security Configuration", category: "Configuration" },
  { id: "spring-code-generator.createApiDocumentation", title: "Create API Documentation (Swagger/OpenAPI)", category: "Configuration" },

  { id: "spring-code-generator.createProjectStructure", title: "Create Project Structure", category: "Project & Structure" },
  { id: "spring-code-generator.createBatchModule", title: "Create Batch Module (Complete Module)", category: "Project & Structure" },
  { id: "spring-code-generator.organizeProjectFiles", title: "Organize Project Files", category: "Project & Structure" },
  { id: "spring-code-generator.analyzeProjectStructure", title: "Analyze Project Structure", category: "Project & Structure" },
  { id: "spring-code-generator.createTestClass", title: "Create Test Class", category: "Project & Structure" },

  { id: "spring-code-generator.createDatabaseMigration", title: "Create Database Migration (Flyway/Liquibase)", category: "Advanced" },
  { id: "spring-code-generator.createVersionedController", title: "Create Versioned API Controller", category: "Advanced" },
  { id: "spring-code-generator.createCustomQuery", title: "Create Custom Query Repository", category: "Advanced" },
  { id: "spring-code-generator.querySuggestions", title: "JPA Query Method Suggestions", category: "Advanced" },
  { id: "spring-code-generator.createMicroserviceComponent", title: "Create Microservice Component", category: "Advanced" },
  { id: "spring-code-generator.createEventDrivenComponent", title: "Create Event-Driven Component (Kafka/RabbitMQ)", category: "Advanced" },
  { id: "spring-code-generator.createCachingConfig", title: "Create Caching Configuration (Redis/Caffeine/EhCache)", category: "Advanced" },
  { id: "spring-code-generator.createScheduledTask", title: "Create Scheduled Task", category: "Advanced" },
];

export const groupByCategory = (): Map<CommandCategory, CatalogEntry[]> => {
  const map = new Map<CommandCategory, CatalogEntry[]>();
  for (const cat of CATEGORY_ORDER) {
    map.set(cat, []);
  }
  for (const entry of COMMAND_CATALOG) {
    map.get(entry.category)!.push(entry);
  }
  return map;
};
