# Spring Boot Code Generator

[![Version](https://img.shields.io/visual-studio-marketplace/v/SonalSithara.spring-code-generator)](https://marketplace.visualstudio.com/items?itemName=SonalSithara.spring-code-generator) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/SonalSithara.spring-code-generator)](https://marketplace.visualstudio.com/items?itemName=SonalSithara.spring-code-generator) [![Ratings](https://img.shields.io/visual-studio-marketplace/r/SonalSithara.spring-code-generator)](https://marketplace.visualstudio.com/items?itemName=SonalSithara.spring-code-generator) ![](https://img.shields.io/github/stars/sonal-sithara/spring-code-generator?style=social&label=Star&maxAge=2592000)

## Overview

A powerful Visual Studio Code extension that accelerates Spring Boot development by automatically generating boilerplate Java code. Create controllers, services, entities, DTOs, repositories, exception handlers, security configurations, and more with a single click.

## Features

### ⚡ Batch Module Generator (NEW!)

Generate an entire module with one command! Create Entity, Repository, Service, Controller, and DTOs simultaneously with smart configuration options.

**How it works:**

1. Right-click on a folder → **Spring Code Generator → Create Batch Module**
2. Enter module name (e.g., "User", "Product")
3. Choose ID data type (Long, Integer, String, etc.)
4. Select components to generate (Entity, Repository, Service, Controller, DTOs)
5. Choose Lombok support (optional)
6. All files are created instantly! ✅

**Perfect for:**

- Creating new feature modules quickly
- Maintaining consistency across modules
- Reducing repetitive file creation
- 70% faster than creating files individually

### 📁 Project Structure Generator (NEW!)

Auto-create recommended Spring Boot folder structure for a new project with a single command!

**How it works:**

1. Right-click on project root → **Spring Code Generator → Create Project Structure**
2. Enter project name (e.g., "MySpringApp")
3. Select optional features (Test folder, README.md, .env.example)
4. Complete folder structure is created instantly! ✅

**Creates folders:**

- `controller/` - REST endpoints
- `service/` - Business logic
- `repository/` - Data access
- `entity/` - JPA entities
- `dto/` - Data transfer objects
- `mapper/` - Entity-DTO converters
- `exception/` - Exception handling
- `config/` - Configuration classes
- `util/` - Utility functions
- `constants/` - App constants
- `test/` - Unit tests (optional)

**Also generates:**

- `README.md` - Project documentation (optional)
- `.env.example` - Environment variables template (optional)

### 🔗 JPA Relationship Generator (NEW!)

Generate JPA relationship annotations with proper cascading and bidirectional support!

**How it works:**

1. **Spring Code Generator → Create JPA Relationship**
2. Enter source entity class name (e.g., "User")
3. Select relationship type:
   - **OneToMany** - One parent, multiple children
   - **ManyToOne** - Multiple parents, one child
   - **ManyToMany** - Many-to-many association
4. Enter relationship field name (e.g., "posts", "comments")
5. Enter target entity name (e.g., "Post", "Comment")
6. Choose bidirectional option (Yes/No)
7. Select cascade options (PERSIST, REMOVE, MERGE, DETACH, REFRESH)
8. Complete relationship code is generated! ✅

**Generated code includes:**

- Proper JPA annotations (`@OneToMany`, `@ManyToOne`, `@ManyToMany`)
- Field declarations with generics (`List<T>`)
- Getters and setters
- Helper methods (add/remove for collections)
- Bidirectional mappings when needed
- Cascade configuration

**Example Output:**

```java
@OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
private List<Post> posts = new ArrayList<>();

public List<Post> getPosts() {
    return posts;
}

public void addPost(Post post) {
    this.posts.add(post);
    post.setUser(this);
}

public void removePost(Post post) {
    this.posts.remove(post);
    post.setUser(null);
}
```

### ⚙️ Configuration Templates Generator (NEW!)

Generate ready-to-use Spring Boot configuration classes quickly!

**How it works:**

1. **Spring Code Generator → Create Configuration Templates**
2. Select one or more configuration types:
   - **Database** - JPA, Hibernate, and transaction management setup
   - **Security** - Spring Security with authentication and authorization
   - **JWT** - JSON Web Token (JWT) authentication setup
   - **CORS** - Cross-Origin Resource Sharing configuration
3. Select and complete! ✅

**Generated configurations include:**

- **Database Configuration**

  - JPA repository scanning
  - Entity scanning
  - Transaction management
  - JPA auditing support
  - Helpful comments for application.yml properties

- **Security Configuration**

  - Password encoder (BCryptPasswordEncoder)
  - Authentication manager
  - Security filter chain setup
  - CSRF protection disable
  - Login/logout configuration

- **JWT Configuration**

  - Token generation from username
  - Token generation with custom claims
  - Username extraction from token
  - Token validation
  - Expiration checking
  - Secret key management (HMAC SHA-512)

- **CORS Configuration**
  - Customizable allowed origins
  - HTTP methods configuration
  - Credentials support
  - Max age settings
  - Common preset origins (localhost:3000, 4200, 8080)

**Perfect for:**

- Quick project setup
- Consistent configuration across projects
- Learning Spring Boot configuration best practices
- Copy-paste ready code with helpful comments

### 📂 File Organization Helper (NEW!)

Automatically organize Spring Boot project files into proper folder structure based on naming conventions!

**How it works:**

1. **Spring Code Generator → Organize Project Files** - Auto-organize all files

   - Scans your src/main/java directory
   - Detects file types from naming conventions
   - Moves files to appropriate folders
   - Creates folders if needed

2. **Spring Code Generator → Analyze Project Structure** - Analyze current organization
   - Reports file distribution across folders
   - Identifies unorganized files
   - Provides recommendations
   - Shows summary in output panel

**File Detection Rules:**

| Pattern                                        | Destination   |
| ---------------------------------------------- | ------------- |
| `*Controller.java`                             | `controller/` |
| `*Service*.java`, `*ServiceImpl.java`          | `service/`    |
| `*Repository.java`                             | `repository/` |
| `*Entity.java`, `*Model.java`                  | `entity/`     |
| `*DTO.java`, `*Request.java`, `*Response.java` | `dto/`        |
| `*Mapper.java`                                 | `mapper/`     |
| `*Converter.java`                              | `mapper/`     |
| `*Exception.java`                              | `exception/`  |
| `*Handler.java`                                | `exception/`  |
| `*Config.java`                                 | `config/`     |
| `*Util.java`                                   | `util/`       |
| `*Constant.java`                               | `constants/`  |
| `*Test.java`                                   | `test/`       |

**Perfect for:**

- Organizing existing projects with scattered files
- Maintaining consistent folder structure
- Quick cleanup after adding new features
- Understanding project organization

### 📚 API Documentation Generator (NEW!)

Generate Swagger/OpenAPI configuration for automatic API documentation!

**How it works:**

1. **Spring Code Generator → Create API Documentation (Swagger/OpenAPI)**
2. Enter project name (e.g., "User Management API")
3. Enter project description (optional)
4. Choose to include JWT Security Scheme (Yes/No)
5. Complete configuration is generated! ✅

**Generated Files:**

- **OpenApiConfig.java** - Spring configuration class
- **SPRINGDOC_OPENAPI_DEPENDENCIES.txt** - Maven dependencies
- **swagger-config.yml** - Application configuration

**Key Features:**

- **Swagger UI Access** - http://localhost:8080/swagger-ui.html
- **OpenAPI JSON** - http://localhost:8080/v3/api-docs
- **OpenAPI YAML** - http://localhost:8080/v3/api-docs.yaml
- **JWT Authentication Support** - Optional security scheme
- **Endpoint Documentation Template** - Example annotations
- **Multi-environment Support** - Dev, staging, production configs

**Perfect for API documentation:**

- Auto-generating interactive API documentation
- Sharing API contracts with frontend teams
- Quick API testing with Swagger UI
- OpenAPI spec compliance
- API versioning and documentation

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

#### Individual File Creation

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

#### Batch Module Creation (Faster!)

With **Create Batch Module**, all files above are generated in one command:

1. Right-click folder
2. Select **Create Batch Module (Complete Module)**
3. Enter "User" as module name
4. Select desired components
5. All 8+ files created instantly!

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

| Command                               | Description                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| **Create Batch Module** ⭐            | Generate complete module (Entity, Repository, Service, Controller, DTOs, etc.) |
| **Create Project Structure** ⭐       | Auto-create recommended folder structure for new Spring Boot projects          |
| **Create JPA Relationship** ⭐        | Generate JPA relationship annotations with cascading and bidirectional support |
| **Create Configuration Templates** ⭐ | Generate configuration classes (Database, Security, JWT, CORS)                 |
| **Organize Project Files** ⭐         | Auto-organize files into proper folder structure                               |
| **Analyze Project Structure** ⭐      | Analyze and report file distribution across folders                            |
| **Create API Documentation** ⭐       | Generate Swagger/OpenAPI configuration                                        |
| Create Controller                     | Generate basic REST controller                                                 |
| Create Controller With CRUD           | Generate controller with CRUD endpoints                                        |
| Create Entity                         | Generate JPA entity                                                            |
| Create Entity With Lombok             | Generate entity with Lombok annotations                                        |
| Create DTO                            | Generate data transfer object                                                  |
| Create DTO With Lombok                | Generate DTO with Lombok annotations                                           |
| Create Repository                     | Generate Spring Data JPA repository (prompts for entity name)                  |
| Create Service Implementation         | Generate service class (prompts for interface name)                            |
| Create Exception                      | Generate custom exception class                                                |
| Create Global Exception Handler       | Generate @RestControllerAdvice with exception handlers                         |
| Create Security Configuration         | Generate Spring Security configuration class                                   |
| Create Test Class                     | Generate JUnit 5 test class with Mockito                                       |
| Create Mapper                         | Generate entity-to-DTO mapper interface                                        |
| Create Converter                      | Generate entity-to-DTO converter component                                     |
| Create Application Properties         | Generate application.properties file                                           |
| Create Application YML                | Generate application.yml file                                                  |
| Create Request DTO                    | Generate HTTP request DTO                                                      |
| Create Response DTO                   | Generate HTTP response DTO                                                     |

### JPA Relationship Configuration Options

When creating a JPA relationship, you configure:

| Option                | Description                             | Example                                  |
| --------------------- | --------------------------------------- | ---------------------------------------- |
| **Entity Class Name** | Source entity for the relationship      | "User", "Product", "Order"               |
| **Relationship Type** | Type of JPA relationship                | OneToMany, ManyToOne, ManyToMany         |
| **Field Name**        | Property name in the entity             | "posts", "comments", "users", "products" |
| **Target Entity**     | Related entity class name               | "Post", "Comment", "User", "Product"     |
| **Bidirectional**     | Whether to map the reverse side         | Yes/No                                   |
| **Cascade Options**   | Operations to cascade (select multiple) | PERSIST, REMOVE, MERGE, DETACH, REFRESH  |

The Project Structure Generator creates the following folders automatically:

| Folder        | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `controller/` | REST endpoints and request handlers             |
| `service/`    | Business logic layer                            |
| `repository/` | Data access layer (JPA repositories)            |
| `entity/`     | JPA entity classes                              |
| `dto/`        | Data transfer objects                           |
| `mapper/`     | Entity-to-DTO converters                        |
| `exception/`  | Custom exceptions and global exception handlers |
| `config/`     | Spring configuration classes (Security, etc.)   |
| `util/`       | Utility and helper functions                    |
| `constants/`  | Application-wide constants                      |
| `test/`       | Unit tests (optional)                           |

It also generates optional files:

- **README.md** - Project documentation with setup instructions
- **.env.example** - Environment variables template for configuration

### Batch Module Configuration Options

When creating a batch module, you can choose:

| Option             | Description                                     | Example                                             |
| ------------------ | ----------------------------------------------- | --------------------------------------------------- |
| **Module Name**    | Name for the module (becomes class name prefix) | "User", "Product", "Order"                          |
| **ID Data Type**   | Primary key data type for entity                | "Long", "Integer", "String", "UUID"                 |
| **Components**     | Select which files to generate                  | Entity, Repository, Service, Controller, DTOs, etc. |
| **Lombok Support** | Use Lombok annotations for cleaner code         | Yes/No                                              |

**Generated Files Example (for "User" module):**

- `User.java` - Entity
- `UserRepository.java` - Repository
- `UserService.java` - Service Interface
- `UserServiceImpl.java` - Service Implementation
- `UserController.java` - REST Controller (with CRUD endpoints)
- `UserDTO.java` - DTO
- `UserRequest.java` - Request DTO
- `UserResponse.java` - Response DTO

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
