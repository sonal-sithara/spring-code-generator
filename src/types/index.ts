// Core data types for templates
export interface TemplateValues {
  className: string;
  packageName: string;
  entityName?: string;
  dataType?: string;
  interfaceName?: string;
}

export interface RepositoryValues {
  entityName: string;
  dataType: string;
}

export interface ServiceImplValues {
  interfaceName: string;
}

export interface BatchModuleConfig {
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

export interface ProjectStructureConfig {
  projectName: string;
  includeTest: boolean;
  includeReadme: boolean;
  includeEnvExample: boolean;
}

export interface GeneratedFile {
  path: any; // vscode.Uri type
  content: string;
}

export interface RelationshipConfig {
  className: string;
  relationshipType: "OneToMany" | "ManyToOne" | "ManyToMany";
  relationshipName: string;
  targetEntity: string;
  isBidirectional: boolean;
  cascadeOptions: string[];
}

export interface ConfigurationConfig {
  type: "Database" | "Security" | "JWT" | "CORS";
}

export interface FileOrganizationConfig {
  operation: "organize" | "analyze";
}

export interface ApiDocumentationConfig {
  projectName: string;
  projectDescription: string;
  includeSecurityScheme: boolean;
}

// Advanced Features Types
export interface MigrationConfig {
  migrationTool: "Flyway" | "Liquibase";
  action: "CreateTable" | "AddColumn" | "DropColumn" | "AddIndex" | "DropTable";
  tableName: string;
  columns?: Array<{ name: string; type: string; nullable: boolean; defaultValue?: string }>;
  columnName?: string;
  columnType?: string;
  indexName?: string;
  indexColumns?: string[];
}

export interface VersionedControllerConfig {
  baseName: string;
  version: string;
  includeVersionInPath: boolean;
  includeVersionInPackage: boolean;
  includeCrud: boolean;
  entityName?: string;
  idType?: string;
}

export interface CustomQueryConfig {
  repositoryName: string;
  entityName: string;
  idType: string;
  queries: CustomQuery[];
}

export interface CustomQuery {
  methodName: string;
  queryType: "SELECT" | "UPDATE" | "DELETE" | "NATIVE";
  returnType: "Single" | "List" | "Page" | "Optional" | "Count" | "Boolean" | "Void";
  parameters: Array<{ name: string; type: string }>;
  query?: string;
}

export interface MicroserviceComponentConfig {
  componentType: "FeignClient" | "ServiceDiscovery" | "ConfigClient" | "CircuitBreaker" | "ApiGateway";
  serviceName?: string;
  serviceUrl?: string;
  fallbackClass?: string;
}

export interface EventDrivenConfig {
  messagingType: "Kafka" | "RabbitMQ";
  componentType: "Producer" | "Consumer" | "Both";
  topicOrQueue: string;
  groupId?: string;
  messageType?: string;
}

export interface CachingConfig {
  cacheProvider: "Redis" | "Caffeine" | "EhCache";
  cacheName: string;
  entityName?: string;
  includeService?: boolean;
}

export interface SchedulingConfig {
  schedulerType: "Cron" | "FixedRate" | "FixedDelay";
  taskName: string;
  cronExpression?: string;
  fixedRate?: string;
  fixedDelay?: string;
}
