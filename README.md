# Spring Boot Code Generator

[![Version](https://img.shields.io/visual-studio-marketplace/v/SonalSithara.spring-code-generator)](https://marketplace.visualstudio.com/items?itemName=SonalSithara.spring-code-generator) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/SonalSithara.spring-code-generator)](https://marketplace.visualstudio.com/items?itemName=SonalSithara.spring-code-generator) [![Ratings](https://img.shields.io/visual-studio-marketplace/r/SonalSithara.spring-code-generator)](https://marketplace.visualstudio.com/items?itemName=SonalSithara.spring-code-generator) ![](https://img.shields.io/github/stars/sonal-sithara/spring-code-generator?style=social&label=Star&maxAge=2592000)

## Overview

A powerful Visual Studio Code extension that accelerates Spring Boot development by automatically generating boilerplate Java code. Create controllers, services, entities, DTOs, repositories, exception handlers, security configurations, and more with a single click.

## Features

### Core Components

- **Controller** - REST controller with request mapping
- **Controller with CRUD** - Controller with complete CRUD operations
- **Entity** - JPA entity with primary key annotation
- **Entity with Lombok** - Entity with Lombok annotations for cleaner code
- **DTO** - Data Transfer Object boilerplate
- **DTO with Lombok** - DTO with Lombok annotations
- **Repository** - Spring Data JPA repository interface

### Advanced Features

- **Service Implementation** - Service class implementing an interface
- **Exception Handler** - Custom exception classes
- **Global Exception Handler** - Centralized exception handling with error responses
- **Security Configuration** - Spring Security configuration boilerplate
- **Mapper** - Entity-to-DTO mapper interface
- **Converter** - Entity-to-DTO converter with conversion logic
- **Test Class** - JUnit 5 test class with Mockito setup
- **Request DTO** - HTTP request DTO template
- **Response DTO** - HTTP response DTO template
- **Application Configuration** - `application.properties` and `application.yml` templates

## Installation

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Spring Code Generator"
4. Click Install

Or install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SonalSithara.spring-code-generator)

## Usage

### Quick Start

1. Right-click on a folder in your Spring Boot project (typically under `src/main/java/com/example/`)
2. Select **Spring Code Generator** → Choose the template you want to create
3. Enter the class name when prompted
4. For some templates (Repository, Service Implementation), additional inputs will be requested

### Example Workflow

```
src/main/java/com/example/
├── User.java                    (Create Entity)
├── UserRepository.java          (Create Repository)
├── UserService.java             (Create Service Implementation)
├── UserServiceImpl.java          (Create Service Implementation)
├── UserController.java          (Create Controller)
├── UserDTO.java                 (Create DTO)
├── UserRequest.java             (Create Request DTO)
├── UserResponse.java            (Create Response DTO)
├── GlobalExceptionHandler.java  (Create Global Exception Handler)
├── UserMapper.java              (Create Mapper)
└── UserTest.java                (Create Test Class)
```

### Code Snippets

Quickly generate Spring endpoint mappings using snippets:

| Snippet     | Description              |
| ----------- | ------------------------ |
| `sp-crud`   | Generate CRUD operations |
| `sp-get`    | Generate GET mapping     |
| `sp-post`   | Generate POST mapping    |
| `sp-put`    | Generate PUT mapping     |
| `sp-delete` | Generate DELETE mapping  |

## Commands Reference

### Available Commands

| Command                         | Description                                                   |
| ------------------------------- | ------------------------------------------------------------- |
| Create Controller               | Generate basic REST controller                                |
| Create Controller With CRUD     | Generate controller with CRUD endpoints                       |
| Create Entity                   | Generate JPA entity                                           |
| Create Entity With Lombok       | Generate entity with Lombok annotations                       |
| Create DTO                      | Generate data transfer object                                 |
| Create DTO With Lombok          | Generate DTO with Lombok annotations                          |
| Create Repository               | Generate Spring Data JPA repository (prompts for entity name) |
| Create Service Implementation   | Generate service class (prompts for interface name)           |
| Create Exception                | Generate custom exception class                               |
| Create Global Exception Handler | Generate @RestControllerAdvice with exception handlers        |
| Create Security Configuration   | Generate Spring Security configuration class                  |
| Create Test Class               | Generate JUnit 5 test class with Mockito                      |
| Create Mapper                   | Generate entity-to-DTO mapper interface                       |
| Create Converter                | Generate entity-to-DTO converter component                    |
| Create Application Properties   | Generate application.properties file                          |
| Create Application YML          | Generate application.yml file                                 |
| Create Request DTO              | Generate HTTP request DTO                                     |
| Create Response DTO             | Generate HTTP response DTO                                    |

## Template Variables

Templates support automatic placeholder replacement:

- **TempClassName** → Replaced with your entered class name
- **package-des** → Replaced with your Java package
- **temp-mapping** → Replaced with lowercase class name (for URL mappings)
- **entityName** → Replaced with entity name (for Repository)
- **dataType** → Replaced with ID data type (for Repository)
- **interfaceName** → Replaced with interface name (for Service Implementation)

## Requirements

- Visual Studio Code 1.66.0 or higher
- Java Development Kit (JDK) 11 or higher
- Spring Boot project structure

## Project Structure

This extension follows standard Spring Boot architecture:

```
src/main/java/com/example/
├── controller/      (REST endpoints)
├── service/         (Business logic)
├── repository/      (Data access)
├── entity/          (JPA entities)
├── dto/             (Data transfer objects)
├── mapper/          (Entity-DTO conversion)
├── exception/       (Custom exceptions)
├── config/          (Configuration classes)
└── test/            (Unit tests)
```

## Tips & Best Practices

1. **Use Lombok** - Choose "with Lombok" versions for cleaner code
2. **Service Implementation** - Always create a service interface first, then implementation
3. **DTOs** - Use separate Request and Response DTOs for API contracts
4. **Exception Handling** - Use Global Exception Handler for centralized error handling
5. **Tests** - Generate test classes immediately after creating services
6. **Package Organization** - Keep separate folders for different component types

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request to the [GitHub repository](https://github.com/sonal-sithara/spring-code-generator).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For issues, feature requests, or questions, please visit the [GitHub Issues](https://github.com/sonal-sithara/spring-code-generator/issues) page.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of changes and releases.

---

**Happy Coding! 🚀**
