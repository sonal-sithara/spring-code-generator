# Change Log

All notable changes to the "spring-code-generator" extension will be documented in this file.

## [3.0.1] - 2026-01-17

### 🚀 Major Update: Advanced Features for Modern Spring Boot Development

This release adds 8 powerful advanced features for building modern, scalable Spring Boot applications including microservices, event-driven systems, and distributed caching.

#### ✨ New Advanced Features

##### 💾 Database Migration Generator

- **Flyway Support**: Generate versioned SQL migration files
- **Liquibase Support**: Generate XML-based database changesets
- **Migration Actions**: Create Table, Add Column, Drop Column, Add Index, Drop Table
- **Interactive Column Definition**: Define multiple columns with types, constraints, and defaults
- **Automatic Timestamping**: Migration files auto-named with timestamps
- **Best Practices**: Follows naming conventions for both Flyway and Liquibase

##### 🔢 API Versioning Support

- **Versioned Controllers**: Generate v1, v2, v3, etc. controllers
- **URL Path Versioning**: Support for `/api/v1/resource` pattern
- **Package Versioning**: Organize controllers in version-specific packages
- **CRUD Operations**: Optional complete REST CRUD operations
- **Multiple ID Types**: Support for Long, Integer, String, UUID
- **JavaDoc Documentation**: Includes comprehensive method documentation

##### 🔍 Custom Query Repository Generator

- **Derived Queries**: Support for Spring Data method naming patterns
- **JPQL Queries**: Generate custom @Query annotations with JPQL
- **Native SQL**: Support for native SQL queries with @Query(nativeQuery = true)
- **Multiple Return Types**: Single, List, Page, Optional, Count, Boolean, Void
- **Pagination Support**: Automatic Pageable parameter handling
- **Query Suggestions**: Built-in examples for 10+ common query patterns
- **Parameter Binding**: Support for @Param annotations
- **Modifying Queries**: @Modifying and @Transactional for UPDATE/DELETE

##### ☁️ Microservices Components Generator

- **Feign Client**: REST client with fallback support for inter-service communication
- **Service Discovery**: Complete Eureka server setup with dashboard
- **Config Client**: Spring Cloud Config client with @RefreshScope
- **Circuit Breaker**: Resilience4j implementation with retry and rate limiting
- **API Gateway**: Spring Cloud Gateway with route configuration and load balancing
- **Complete Configurations**: All components include application.yml files
- **Production Ready**: Includes error handling, logging, and best practices

##### 📨 Event-Driven Components (Kafka/RabbitMQ)

- **Kafka Producer**: KafkaTemplate-based message publishing with JSON serialization
- **Kafka Consumer**: @KafkaListener with error handling and offset management
- **RabbitMQ Producer**: RabbitTemplate with message conversion
- **RabbitMQ Consumer**: @RabbitListener with queue, exchange, and binding setup
- **Message Classes**: Auto-generate serializable message/event POJOs
- **Configuration Files**: Complete Kafka/RabbitMQ application.yml configs
- **Error Handling**: Built-in retry logic and dead letter queue support
- **Both Modes**: Generate Producer, Consumer, or Both in one command

##### 💨 Caching Configuration Generator

- **Redis Caching**: Distributed caching with RedisCacheManager and TTL
- **Caffeine Caching**: High-performance in-memory cache with statistics
- **EhCache**: JSR-107 compliant caching with ehcache.xml generation
- **Service Examples**: Complete service class with @Cacheable, @CachePut, @CacheEvict
- **Cache Key Management**: Proper key serialization and management
- **Configuration Files**: Redis/Caffeine/EhCache application configs
- **TTL Support**: Time-to-live configuration for cache entries
- **Connection Pooling**: Lettuce connection pool for Redis

##### ⏰ Scheduled Task Generator

- **Cron Scheduling**: Generate cron-based scheduled tasks
- **Fixed Rate**: Execute at fixed time intervals
- **Fixed Delay**: Execute with fixed delay between completions
- **Cron Presets**: 5+ common cron expression presets
- **Custom Expressions**: Support for custom cron patterns
- **Error Handling**: Built-in try-catch with logging
- **Execution Tracking**: Logs start and completion times
- **@EnableScheduling Ready**: Includes setup instructions

#### 📊 Commands Added

- `Create Database Migration (Flyway/Liquibase)`
- `Create Versioned API Controller`
- `Create Custom Query Repository`
- `JPA Query Method Suggestions`
- `Create Microservice Component`
- `Create Event-Driven Component (Kafka/RabbitMQ)`
- `Create Caching Configuration (Redis/Caffeine/EhCache)`
- `Create Scheduled Task`

#### 🔧 Technical Improvements

- Added 6 new generator modules
- Added 8 new TypeScript interfaces for type safety
- Updated extension activation events
- Added context menu items for all new commands
- Comprehensive error handling for all new features
- Interactive wizards with validation

#### 📚 Documentation

- Updated README with detailed feature documentation
- Added usage examples for all new features
- Included code samples and configuration examples
- Added troubleshooting guides
- Updated command reference table

### 🎯 Use Cases

Perfect for building:

- **Microservices Architecture**: Feign clients, service discovery, API gateway
- **Event-Driven Systems**: Kafka/RabbitMQ producers and consumers
- **Distributed Applications**: Redis caching for multiple instances
- **Versioned APIs**: Maintain multiple API versions simultaneously
- **Database Evolution**: Version-controlled schema migrations
- **Scheduled Jobs**: Background tasks and periodic operations
- **High-Performance Apps**: Multi-level caching strategies

## [2.0.0]

- Batch Module Generator
- Project Structure Generator
- JPA Relationship Generator
- Configuration Templates Generator
- File Organization Helper
- Project Structure Analyzer
- API Documentation Generator (Swagger/OpenAPI)

## [1.1.0] - 2023-02-15

- Templates Improvements
- Add Lombok Support

## [1.0.0]

- Initial release
