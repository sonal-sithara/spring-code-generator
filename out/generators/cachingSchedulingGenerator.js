"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScheduledTask = exports.createCachingConfiguration = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const fileUtils_1 = require("../utils/fileUtils");
async function createCachingConfiguration(uri) {
    try {
        const folderPath = uri ? uri.fsPath : undefined;
        if (!folderPath) {
            vscode.window.showErrorMessage("Please select a folder first!");
            return;
        }
        // Select cache provider
        const cacheProvider = await vscode.window.showQuickPick([
            { label: "Redis", description: "Distributed caching with Redis" },
            { label: "Caffeine", description: "High-performance in-memory cache" },
            { label: "EhCache", description: "Popular Java caching library" },
        ], {
            placeHolder: "Select cache provider",
            ignoreFocusOut: true,
        });
        if (!cacheProvider) {
            return;
        }
        const config = {
            cacheProvider: cacheProvider.label,
            cacheName: "",
        };
        // Get cache name
        config.cacheName = await vscode.window.showInputBox({
            prompt: "Enter cache name",
            placeHolder: "users, products, orders",
            ignoreFocusOut: true,
        }) || "defaultCache";
        // Ask if service example should be included
        const includeService = await vscode.window.showQuickPick(["Yes", "No"], {
            placeHolder: "Include service example with caching?",
            ignoreFocusOut: true,
        });
        config.includeService = includeService === "Yes";
        if (config.includeService) {
            config.entityName = await vscode.window.showInputBox({
                prompt: "Enter entity name for service example",
                placeHolder: "User, Product, Order",
                ignoreFocusOut: true,
            }) || "Entity";
        }
        // Generate files
        const files = generateCachingFiles(config, folderPath);
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
        vscode.window.showInformationMessage(`✅ ${cacheProvider.label} caching configuration created with ${files.length} file(s)!`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to create caching configuration: ${error.message}`);
    }
}
exports.createCachingConfiguration = createCachingConfiguration;
async function createScheduledTask(uri) {
    try {
        const folderPath = uri ? uri.fsPath : undefined;
        if (!folderPath) {
            vscode.window.showErrorMessage("Please select a folder first!");
            return;
        }
        // Get task name
        const taskName = await vscode.window.showInputBox({
            prompt: "Enter task name",
            placeHolder: "DataCleanup, ReportGeneration, EmailReminder",
            ignoreFocusOut: true,
        });
        if (!taskName) {
            return;
        }
        // Select scheduler type
        const schedulerType = await vscode.window.showQuickPick([
            { label: "Cron", description: "Cron expression for scheduling" },
            { label: "FixedRate", description: "Fixed rate interval" },
            { label: "FixedDelay", description: "Fixed delay between executions" },
        ], {
            placeHolder: "Select scheduler type",
            ignoreFocusOut: true,
        });
        if (!schedulerType) {
            return;
        }
        const config = {
            schedulerType: schedulerType.label,
            taskName,
        };
        if (schedulerType.label === "Cron") {
            // Show cron examples
            const cronExample = await vscode.window.showQuickPick([
                { label: "0 0 * * * *", description: "Every hour" },
                { label: "0 0 0 * * *", description: "Every day at midnight" },
                { label: "0 0 9 * * MON-FRI", description: "Weekdays at 9 AM" },
                { label: "0 */15 * * * *", description: "Every 15 minutes" },
                { label: "0 0 12 * * *", description: "Every day at noon" },
                { label: "Custom", description: "Enter custom cron expression" },
            ], {
                placeHolder: "Select cron expression or choose custom",
                ignoreFocusOut: true,
            });
            if (cronExample?.label === "Custom") {
                config.cronExpression = await vscode.window.showInputBox({
                    prompt: "Enter cron expression",
                    placeHolder: "0 0 12 * * *",
                    ignoreFocusOut: true,
                }) || "0 0 12 * * *";
            }
            else {
                config.cronExpression = cronExample?.label || "0 0 12 * * *";
            }
        }
        else if (schedulerType.label === "FixedRate") {
            config.fixedRate = await vscode.window.showInputBox({
                prompt: "Enter fixed rate (in milliseconds)",
                placeHolder: "5000 (5 seconds)",
                ignoreFocusOut: true,
            }) || "60000";
        }
        else {
            config.fixedDelay = await vscode.window.showInputBox({
                prompt: "Enter fixed delay (in milliseconds)",
                placeHolder: "5000 (5 seconds)",
                ignoreFocusOut: true,
            }) || "60000";
        }
        // Generate file
        const content = generateScheduledTaskFile(config, folderPath);
        const fileName = `${taskName}Task.java`;
        const filePath = path.join(folderPath, fileName);
        // Write file
        fs.writeFileSync(filePath, content);
        // Open the file
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
        vscode.window.showInformationMessage(`✅ Scheduled task created: ${fileName}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to create scheduled task: ${error.message}`);
    }
}
exports.createScheduledTask = createScheduledTask;
function generateCachingFiles(config, folderPath) {
    switch (config.cacheProvider) {
        case "Redis":
            return generateRedisCache(config, folderPath);
        case "Caffeine":
            return generateCaffeineCache(config, folderPath);
        case "EhCache":
            return generateEhCache(config, folderPath);
        default:
            return [];
    }
}
function generateRedisCache(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    const files = [];
    // Redis Configuration
    let configContent = `package ${packageName};\n\n`;
    configContent += `import org.springframework.cache.annotation.EnableCaching;\n`;
    configContent += `import org.springframework.context.annotation.Bean;\n`;
    configContent += `import org.springframework.context.annotation.Configuration;\n`;
    configContent += `import org.springframework.data.redis.cache.RedisCacheConfiguration;\n`;
    configContent += `import org.springframework.data.redis.cache.RedisCacheManager;\n`;
    configContent += `import org.springframework.data.redis.connection.RedisConnectionFactory;\n`;
    configContent += `import org.springframework.data.redis.core.RedisTemplate;\n`;
    configContent += `import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;\n`;
    configContent += `import org.springframework.data.redis.serializer.RedisSerializationContext;\n`;
    configContent += `import org.springframework.data.redis.serializer.StringRedisSerializer;\n`;
    configContent += `import java.time.Duration;\n\n`;
    configContent += `/**\n`;
    configContent += ` * Redis Cache Configuration\n`;
    configContent += ` * \n`;
    configContent += ` * Required dependencies in pom.xml:\n`;
    configContent += ` * <dependency>\n`;
    configContent += ` *     <groupId>org.springframework.boot</groupId>\n`;
    configContent += ` *     <artifactId>spring-boot-starter-data-redis</artifactId>\n`;
    configContent += ` * </dependency>\n`;
    configContent += ` * <dependency>\n`;
    configContent += ` *     <groupId>org.springframework.boot</groupId>\n`;
    configContent += ` *     <artifactId>spring-boot-starter-cache</artifactId>\n`;
    configContent += ` * </dependency>\n`;
    configContent += ` */\n`;
    configContent += `@Configuration\n`;
    configContent += `@EnableCaching\n`;
    configContent += `public class RedisConfig {\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {\n`;
    configContent += `        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()\n`;
    configContent += `            .entryTtl(Duration.ofHours(1)) // Cache TTL\n`;
    configContent += `            .serializeKeysWith(\n`;
    configContent += `                RedisSerializationContext.SerializationPair.fromSerializer(\n`;
    configContent += `                    new StringRedisSerializer()))\n`;
    configContent += `            .serializeValuesWith(\n`;
    configContent += `                RedisSerializationContext.SerializationPair.fromSerializer(\n`;
    configContent += `                    new GenericJackson2JsonRedisSerializer()))\n`;
    configContent += `            .disableCachingNullValues();\n\n`;
    configContent += `        return RedisCacheManager.builder(connectionFactory)\n`;
    configContent += `            .cacheDefaults(config)\n`;
    configContent += `            .build();\n`;
    configContent += `    }\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {\n`;
    configContent += `        RedisTemplate<String, Object> template = new RedisTemplate<>();\n`;
    configContent += `        template.setConnectionFactory(connectionFactory);\n`;
    configContent += `        template.setKeySerializer(new StringRedisSerializer());\n`;
    configContent += `        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());\n`;
    configContent += `        return template;\n`;
    configContent += `    }\n`;
    configContent += `}\n`;
    files.push({ name: "RedisConfig.java", content: configContent });
    // Service with caching
    if (config.includeService && config.entityName) {
        const serviceContent = generateCachedService(config, packageName);
        files.push({ name: `${config.entityName}CachedService.java`, content: serviceContent });
    }
    // application.yml
    let ymlContent = `# Redis Configuration\n`;
    ymlContent += `spring:\n`;
    ymlContent += `  redis:\n`;
    ymlContent += `    host: localhost\n`;
    ymlContent += `    port: 6379\n`;
    ymlContent += `    password: # Set if required\n`;
    ymlContent += `    timeout: 2000ms\n`;
    ymlContent += `    lettuce:\n`;
    ymlContent += `      pool:\n`;
    ymlContent += `        max-active: 8\n`;
    ymlContent += `        max-idle: 8\n`;
    ymlContent += `        min-idle: 0\n`;
    ymlContent += `        max-wait: -1ms\n`;
    ymlContent += `  cache:\n`;
    ymlContent += `    type: redis\n`;
    ymlContent += `    redis:\n`;
    ymlContent += `      time-to-live: 3600000 # 1 hour in milliseconds\n`;
    ymlContent += `      cache-null-values: false\n`;
    files.push({ name: "application-redis.yml", content: ymlContent });
    return files;
}
function generateCaffeineCache(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    const files = [];
    // Caffeine Configuration
    let configContent = `package ${packageName};\n\n`;
    configContent += `import com.github.benmanes.caffeine.cache.Caffeine;\n`;
    configContent += `import org.springframework.cache.CacheManager;\n`;
    configContent += `import org.springframework.cache.annotation.EnableCaching;\n`;
    configContent += `import org.springframework.cache.caffeine.CaffeineCacheManager;\n`;
    configContent += `import org.springframework.context.annotation.Bean;\n`;
    configContent += `import org.springframework.context.annotation.Configuration;\n`;
    configContent += `import java.util.concurrent.TimeUnit;\n\n`;
    configContent += `/**\n`;
    configContent += ` * Caffeine Cache Configuration\n`;
    configContent += ` * High-performance in-memory caching\n`;
    configContent += ` * \n`;
    configContent += ` * Required dependencies in pom.xml:\n`;
    configContent += ` * <dependency>\n`;
    configContent += ` *     <groupId>org.springframework.boot</groupId>\n`;
    configContent += ` *     <artifactId>spring-boot-starter-cache</artifactId>\n`;
    configContent += ` * </dependency>\n`;
    configContent += ` * <dependency>\n`;
    configContent += ` *     <groupId>com.github.ben-manes.caffeine</groupId>\n`;
    configContent += ` *     <artifactId>caffeine</artifactId>\n`;
    configContent += ` * </dependency>\n`;
    configContent += ` */\n`;
    configContent += `@Configuration\n`;
    configContent += `@EnableCaching\n`;
    configContent += `public class CaffeineConfig {\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public CacheManager cacheManager() {\n`;
    configContent += `        CaffeineCacheManager cacheManager = new CaffeineCacheManager("${config.cacheName}");\n`;
    configContent += `        cacheManager.setCaffeine(caffeineCacheBuilder());\n`;
    configContent += `        return cacheManager;\n`;
    configContent += `    }\n\n`;
    configContent += `    private Caffeine<Object, Object> caffeineCacheBuilder() {\n`;
    configContent += `        return Caffeine.newBuilder()\n`;
    configContent += `            .maximumSize(1000) // Maximum cache size\n`;
    configContent += `            .expireAfterWrite(1, TimeUnit.HOURS) // Expire after 1 hour\n`;
    configContent += `            .expireAfterAccess(30, TimeUnit.MINUTES) // Expire after 30 min of inactivity\n`;
    configContent += `            .recordStats(); // Enable statistics\n`;
    configContent += `    }\n`;
    configContent += `}\n`;
    files.push({ name: "CaffeineConfig.java", content: configContent });
    // Service with caching
    if (config.includeService && config.entityName) {
        const serviceContent = generateCachedService(config, packageName);
        files.push({ name: `${config.entityName}CachedService.java`, content: serviceContent });
    }
    return files;
}
function generateEhCache(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    const files = [];
    // EhCache Configuration
    let configContent = `package ${packageName};\n\n`;
    configContent += `import org.springframework.cache.annotation.EnableCaching;\n`;
    configContent += `import org.springframework.context.annotation.Configuration;\n\n`;
    configContent += `/**\n`;
    configContent += ` * EhCache Configuration\n`;
    configContent += ` * \n`;
    configContent += ` * Required dependencies in pom.xml:\n`;
    configContent += ` * <dependency>\n`;
    configContent += ` *     <groupId>org.springframework.boot</groupId>\n`;
    configContent += ` *     <artifactId>spring-boot-starter-cache</artifactId>\n`;
    configContent += ` * </dependency>\n`;
    configContent += ` * <dependency>\n`;
    configContent += ` *     <groupId>javax.cache</groupId>\n`;
    configContent += ` *     <artifactId>cache-api</artifactId>\n`;
    configContent += ` * </dependency>\n`;
    configContent += ` * <dependency>\n`;
    configContent += ` *     <groupId>org.ehcache</groupId>\n`;
    configContent += ` *     <artifactId>ehcache</artifactId>\n`;
    configContent += ` * </dependency>\n`;
    configContent += ` * \n`;
    configContent += ` * Note: Create ehcache.xml in src/main/resources\n`;
    configContent += ` */\n`;
    configContent += `@Configuration\n`;
    configContent += `@EnableCaching\n`;
    configContent += `public class EhCacheConfig {\n`;
    configContent += `    // Configuration is loaded from ehcache.xml\n`;
    configContent += `}\n`;
    files.push({ name: "EhCacheConfig.java", content: configContent });
    // ehcache.xml
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlContent += `<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xmlContent += `        xmlns="http://www.ehcache.org/v3"\n`;
    xmlContent += `        xsi:schemaLocation="http://www.ehcache.org/v3 http://www.ehcache.org/schema/ehcache-core-3.0.xsd">\n\n`;
    xmlContent += `    <cache alias="${config.cacheName}">\n`;
    xmlContent += `        <key-type>java.lang.Long</key-type>\n`;
    xmlContent += `        <value-type>java.lang.Object</value-type>\n`;
    xmlContent += `        <expiry>\n`;
    xmlContent += `            <ttl unit="hours">1</ttl>\n`;
    xmlContent += `        </expiry>\n`;
    xmlContent += `        <resources>\n`;
    xmlContent += `            <heap unit="entries">1000</heap>\n`;
    xmlContent += `        </resources>\n`;
    xmlContent += `    </cache>\n\n`;
    xmlContent += `</config>\n`;
    files.push({ name: "ehcache.xml", content: xmlContent });
    // Service with caching
    if (config.includeService && config.entityName) {
        const serviceContent = generateCachedService(config, packageName);
        files.push({ name: `${config.entityName}CachedService.java`, content: serviceContent });
    }
    return files;
}
function generateCachedService(config, packageName) {
    const entityName = config.entityName;
    const entityVar = entityName.charAt(0).toLowerCase() + entityName.slice(1);
    let content = `package ${packageName};\n\n`;
    content += `import org.springframework.cache.annotation.CacheEvict;\n`;
    content += `import org.springframework.cache.annotation.CachePut;\n`;
    content += `import org.springframework.cache.annotation.Cacheable;\n`;
    content += `import org.springframework.stereotype.Service;\n`;
    content += `import java.util.List;\n\n`;
    content += `/**\n`;
    content += ` * ${entityName} Service with caching\n`;
    content += ` * Cache name: ${config.cacheName}\n`;
    content += ` */\n`;
    content += `@Service\n`;
    content += `public class ${entityName}CachedService {\n\n`;
    // Get with cache
    content += `    /**\n`;
    content += `     * Get ${entityVar} by ID - cached\n`;
    content += `     */\n`;
    content += `    @Cacheable(value = "${config.cacheName}", key = "#id")\n`;
    content += `    public ${entityName} get${entityName}ById(Long id) {\n`;
    content += `        // TODO: Implement database query\n`;
    content += `        // Simulating expensive operation\n`;
    content += `        return new ${entityName}();\n`;
    content += `    }\n\n`;
    // Get all with cache
    content += `    /**\n`;
    content += `     * Get all ${entityVar}s - cached\n`;
    content += `     */\n`;
    content += `    @Cacheable(value = "${config.cacheName}")\n`;
    content += `    public List<${entityName}> getAll${entityName}s() {\n`;
    content += `        // TODO: Implement database query\n`;
    content += `        return List.of();\n`;
    content += `    }\n\n`;
    // Update cache
    content += `    /**\n`;
    content += `     * Update ${entityVar} - updates cache\n`;
    content += `     */\n`;
    content += `    @CachePut(value = "${config.cacheName}", key = "#${entityVar}.id")\n`;
    content += `    public ${entityName} update${entityName}(${entityName} ${entityVar}) {\n`;
    content += `        // TODO: Implement database update\n`;
    content += `        return ${entityVar};\n`;
    content += `    }\n\n`;
    // Evict cache
    content += `    /**\n`;
    content += `     * Delete ${entityVar} - evicts from cache\n`;
    content += `     */\n`;
    content += `    @CacheEvict(value = "${config.cacheName}", key = "#id")\n`;
    content += `    public void delete${entityName}(Long id) {\n`;
    content += `        // TODO: Implement database delete\n`;
    content += `    }\n\n`;
    // Clear all cache
    content += `    /**\n`;
    content += `     * Clear all cache\n`;
    content += `     */\n`;
    content += `    @CacheEvict(value = "${config.cacheName}", allEntries = true)\n`;
    content += `    public void clearCache() {\n`;
    content += `        // Cache cleared\n`;
    content += `    }\n`;
    content += `}\n`;
    return content;
}
function generateScheduledTaskFile(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    let content = `package ${packageName};\n\n`;
    content += `import org.springframework.scheduling.annotation.Scheduled;\n`;
    content += `import org.springframework.stereotype.Component;\n`;
    content += `import org.slf4j.Logger;\n`;
    content += `import org.slf4j.LoggerFactory;\n`;
    content += `import java.time.LocalDateTime;\n\n`;
    content += `/**\n`;
    content += ` * Scheduled Task: ${config.taskName}\n`;
    content += ` * \n`;
    content += ` * Make sure to add @EnableScheduling to your main application class:\n`;
    content += ` * @EnableScheduling\n`;
    content += ` * @SpringBootApplication\n`;
    content += ` * public class Application { ... }\n`;
    content += ` */\n`;
    content += `@Component\n`;
    content += `public class ${config.taskName}Task {\n\n`;
    content += `    private static final Logger logger = LoggerFactory.getLogger(${config.taskName}Task.class);\n\n`;
    // Generate annotation based on scheduler type
    if (config.schedulerType === "Cron") {
        content += `    @Scheduled(cron = "${config.cronExpression}")\n`;
    }
    else if (config.schedulerType === "FixedRate") {
        content += `    @Scheduled(fixedRate = ${config.fixedRate})\n`;
    }
    else {
        content += `    @Scheduled(fixedDelay = ${config.fixedDelay})\n`;
    }
    content += `    public void execute() {\n`;
    content += `        logger.info("${config.taskName} task started at: {}", LocalDateTime.now());\n\n`;
    content += `        try {\n`;
    content += `            // TODO: Implement your scheduled task logic here\n`;
    content += `            performTask();\n\n`;
    content += `            logger.info("${config.taskName} task completed successfully");\n`;
    content += `        } catch (Exception e) {\n`;
    content += `            logger.error("Error executing ${config.taskName} task", e);\n`;
    content += `        }\n`;
    content += `    }\n\n`;
    content += `    private void performTask() {\n`;
    content += `        // Implement your task logic\n`;
    content += `        logger.debug("Executing ${config.taskName}...");\n`;
    content += `    }\n`;
    content += `}\n`;
    return content;
}
//# sourceMappingURL=cachingSchedulingGenerator.js.map