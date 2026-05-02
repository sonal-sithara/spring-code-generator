import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { extractPackageName } from "../utils/fileUtils";
import { requireFolderPath } from "../utils/validation";
import { showForm } from "../forms/FormPanel";
import { cachingSchema } from "../forms/schemas/cachingSchema";
import { schedulingSchema } from "../forms/schemas/schedulingSchema";
import { getBool, getString, getStringOr } from "../forms/utils";

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

export async function createCachingConfiguration(uri: vscode.Uri | undefined) {
  try {
    const folderPath = requireFolderPath(uri);
    if (!folderPath) {
      return;
    }

    const result = await showForm(cachingSchema);
    if (!result) {
      return;
    }

    const includeService = getBool(result, "includeService");
    const config: CachingConfig = {
      cacheProvider: result.cacheProvider as CachingConfig["cacheProvider"],
      cacheName: getStringOr(result, "cacheName", "defaultCache"),
      includeService,
      entityName: includeService
        ? getStringOr(result, "entityName", "Entity")
        : undefined,
    };

    const files = generateCachingFiles(config, folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file.name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content);
    }

    if (files.length > 0) {
      const firstFilePath = path.join(folderPath, files[0].name);
      const document = await vscode.workspace.openTextDocument(firstFilePath);
      await vscode.window.showTextDocument(document);
    }

    vscode.window.showInformationMessage(
      `✅ ${config.cacheProvider} caching configuration created with ${files.length} file(s)!`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to create caching configuration: ${error.message}`
    );
  }
}

export async function createScheduledTask(uri: vscode.Uri | undefined) {
  try {
    const folderPath = requireFolderPath(uri);
    if (!folderPath) {
      return;
    }

    const result = await showForm(schedulingSchema);
    if (!result) {
      return;
    }

    const schedulerType = result.schedulerType as SchedulingConfig["schedulerType"];
    const config: SchedulingConfig = {
      schedulerType,
      taskName: getString(result, "taskName"),
    };

    if (schedulerType === "Cron") {
      const preset = getStringOr(result, "cronPreset", "0 0 12 * * *");
      config.cronExpression = preset === "Custom"
        ? getStringOr(result, "cronExpression", "0 0 12 * * *")
        : preset;
    } else if (schedulerType === "FixedRate") {
      config.fixedRate = getStringOr(result, "fixedRate", "60000");
    } else {
      config.fixedDelay = getStringOr(result, "fixedDelay", "60000");
    }

    const content = generateScheduledTaskFile(config, folderPath);
    const fileName = `${config.taskName}Task.java`;
    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, content);

    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      `✅ Scheduled task created: ${fileName}`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to create scheduled task: ${error.message}`
    );
  }
}

interface GeneratedFile {
  name: string;
  content: string;
}

function generateCachingFiles(
  config: CachingConfig,
  folderPath: string
): GeneratedFile[] {
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

function generateRedisCache(
  config: CachingConfig,
  folderPath: string
): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const files: GeneratedFile[] = [];

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

  if (config.includeService && config.entityName) {
    const serviceContent = generateCachedService(config, packageName);
    files.push({ name: `${config.entityName}CachedService.java`, content: serviceContent });
  }

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

function generateCaffeineCache(
  config: CachingConfig,
  folderPath: string
): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const files: GeneratedFile[] = [];

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

  if (config.includeService && config.entityName) {
    const serviceContent = generateCachedService(config, packageName);
    files.push({ name: `${config.entityName}CachedService.java`, content: serviceContent });
  }

  return files;
}

function generateEhCache(
  config: CachingConfig,
  folderPath: string
): GeneratedFile[] {
  const packageName = extractPackageName(folderPath);
  const files: GeneratedFile[] = [];

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

  if (config.includeService && config.entityName) {
    const serviceContent = generateCachedService(config, packageName);
    files.push({ name: `${config.entityName}CachedService.java`, content: serviceContent });
  }

  return files;
}

function generateCachedService(config: CachingConfig, packageName: string): string {
  const entityName = config.entityName!;
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

  content += `    /**\n`;
  content += `     * Get ${entityVar} by ID - cached\n`;
  content += `     */\n`;
  content += `    @Cacheable(value = "${config.cacheName}", key = "#id")\n`;
  content += `    public ${entityName} get${entityName}ById(Long id) {\n`;
  content += `        // TODO: Implement database query\n`;
  content += `        return new ${entityName}();\n`;
  content += `    }\n\n`;

  content += `    /**\n`;
  content += `     * Get all ${entityVar}s - cached\n`;
  content += `     */\n`;
  content += `    @Cacheable(value = "${config.cacheName}")\n`;
  content += `    public List<${entityName}> getAll${entityName}s() {\n`;
  content += `        // TODO: Implement database query\n`;
  content += `        return List.of();\n`;
  content += `    }\n\n`;

  content += `    /**\n`;
  content += `     * Update ${entityVar} - updates cache\n`;
  content += `     */\n`;
  content += `    @CachePut(value = "${config.cacheName}", key = "#${entityVar}.id")\n`;
  content += `    public ${entityName} update${entityName}(${entityName} ${entityVar}) {\n`;
  content += `        // TODO: Implement database update\n`;
  content += `        return ${entityVar};\n`;
  content += `    }\n\n`;

  content += `    /**\n`;
  content += `     * Delete ${entityVar} - evicts from cache\n`;
  content += `     */\n`;
  content += `    @CacheEvict(value = "${config.cacheName}", key = "#id")\n`;
  content += `    public void delete${entityName}(Long id) {\n`;
  content += `        // TODO: Implement database delete\n`;
  content += `    }\n\n`;

  content += `    /**\n`;
  content += `     * Clear all cache\n`;
  content += `     */\n`;
  content += `    @CacheEvict(value = "${config.cacheName}", allEntries = true)\n`;
  content += `    public void clearCache() {\n`;
  content += `    }\n`;
  content += `}\n`;

  return content;
}

function generateScheduledTaskFile(
  config: SchedulingConfig,
  folderPath: string
): string {
  const packageName = extractPackageName(folderPath);
  
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

  if (config.schedulerType === "Cron") {
    content += `    @Scheduled(cron = "${config.cronExpression}")\n`;
  } else if (config.schedulerType === "FixedRate") {
    content += `    @Scheduled(fixedRate = ${config.fixedRate})\n`;
  } else {
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
  content += `        logger.debug("Executing ${config.taskName}...");\n`;
  content += `    }\n`;
  content += `}\n`;

  return content;
}
