# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **VS Code extension** that generates Spring Boot boilerplate code. It provides context-menu commands to create Java components (Controllers, Entities, DTOs, Repositories, Services, etc.) from templates.

## Development Commands

```bash
# Install dependencies
yarn install

# Compile TypeScript to JavaScript (output in out/)
yarn run compile

# Watch mode for development
yarn run watch

# Run linter
yarn run lint

# Run tests
yarn run test

# Compile before testing (lint + compile + test)
yarn run pretest
```

## Architecture

### Extension Entry Point
- `src/extension.ts` - Main entry point that registers all VS Code commands
- `activate()` function registers 28+ commands mapped to generator functions

### Code Generation Flow
1. **Commands** are defined in `extension.ts` with prefix `spring-code-generator.`
2. **Generators** in `src/generators/` handle the logic for each command
3. **Templates** are stored as `.txt` files in `out/template/`
4. **Placeholders** in templates are replaced at generation time

### Template System
Templates use these placeholders (defined in `src/constants/index.ts`):
- `package-des` → Java package name (extracted from folder path)
- `TempClassName` → User-provided class name
- `temp-mapping` → Lowercase class name for URL mappings
- `entityName` → Entity name for Repository
- `dataType` → ID type (Long, Integer, String, UUID)
- `interfaceName` → Interface name for Service Implementation

### Key Directories
```
src/
├── extension.ts        # Entry point, command registration
├── generators/         # Code generation modules (13 generators)
│   ├── fileGenerator.ts       # Single file generation
│   ├── moduleGenerator.ts     # Batch module generation
│   ├── structureGenerator.ts  # Project structure creation
│   ├── relationshipGenerator.ts
│   ├── configurationGenerator.ts
│   ├── fileOrganizationGenerator.ts
│   ├── apiDocumentationGenerator.ts
│   ├── migrationGenerator.ts
│   ├── versioningGenerator.ts
│   ├── customQueryGenerator.ts
│   ├── microservicesGenerator.ts
│   ├── eventDrivenGenerator.ts
│   └── cachingSchedulingGenerator.ts
├── utils/
│   ├── fileUtils.ts    # File I/O, package extraction, template reading
│   └── validation.ts   # User input prompts and validation
├── constants/index.ts  # Template placeholders, file extensions
└── types/index.ts      # TypeScript interfaces for configs
```

### Generated File Extensions
The extension supports multiple file types (see `src/constants/index.ts`):
- `.java` - Java source files
- `.properties` - Application properties
- `.yml` - YAML configuration

## Adding New Features

### Adding a New Template
1. Create template file in `out/template/{template-name}.txt`
2. Add template type to `TEMPLATE_TYPES` in `extension.ts`
3. Register command in `commandConfigs` array
4. Define command ID in `COMMANDS` constant

### Adding a New Generator
1. Create new file in `src/generators/`
2. Import and register command in `extension.ts`
3. Use utilities from `utils/fileUtils.ts` for file operations
4. Define types in `types/index.ts` if needed

## Package Manager

This project uses **yarn** (yarn.lock is present). Use `yarn` commands, not `npm`.
