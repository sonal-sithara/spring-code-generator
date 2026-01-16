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
