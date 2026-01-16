"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = void 0;
const vscode = require("vscode");
const validation_1 = require("../utils/validation");
/**
 * Generate quick configuration templates for Spring Boot
 * Supports Database, Security, JWT, and CORS configurations
 */
async function createConfiguration() {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found");
            return;
        }
        // Get configuration types from user
        const configTypes = await (0, validation_1.getConfigurationTypes)();
        if (!configTypes || configTypes.length === 0) {
            vscode.window.showWarningMessage("No configuration types selected");
            return;
        }
        const configs = configTypes.map((type) => ({
            type: type.label,
        }));
        // Generate configuration files
        await generateConfigurationFiles(workspaceFolder, configs);
        vscode.window.showInformationMessage(`✓ Configuration templates generated: ${configTypes.map((c) => c.label).join(", ")}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error generating configuration: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
exports.createConfiguration = createConfiguration;
/**
 * Generate configuration files based on selected types
 */
async function generateConfigurationFiles(workspaceFolder, configs) {
    for (const config of configs) {
        const content = getConfigurationTemplate(config.type);
        const fileName = `${config.type.toLowerCase()}-config.java`;
        const uri = vscode.Uri.joinPath(workspaceFolder.uri, "src", "main", "java", "config", fileName);
        try {
            // Create config folder if needed
            const configFolderUri = vscode.Uri.joinPath(workspaceFolder.uri, "src", "main", "java", "config");
            try {
                await vscode.workspace.fs.stat(configFolderUri);
            }
            catch {
                await vscode.workspace.fs.createDirectory(configFolderUri);
            }
            // Write file
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
/**
 * Get template content based on configuration type
 */
function getConfigurationTemplate(type) {
    switch (type) {
        case "Database":
            return getDatabaseConfigTemplate();
        case "Security":
            return getSecurityConfigTemplate();
        case "JWT":
            return getJwtConfigTemplate();
        case "CORS":
            return getCorsConfigTemplate();
        default:
            return "";
    }
}
/**
 * Database Configuration Template
 */
function getDatabaseConfigTemplate() {
    return `package config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Database Configuration
 * Configures JPA, Hibernate, and transaction management
 */
@Configuration
@EnableJpaRepositories(basePackages = {"com.example.repository"})
@EntityScan(basePackages = {"com.example.entity"})
@EnableTransactionManagement
@EnableJpaAuditing
public class DatabaseConfig {
    
    // Database configuration is managed via application.yml or application.properties
    // Commonly configured properties:
    
    /*
     * spring.datasource.url=jdbc:mysql://localhost:3306/database_name
     * spring.datasource.username=root
     * spring.datasource.password=password
     * spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
     * 
     * spring.jpa.hibernate.ddl-auto=update
     * spring.jpa.show-sql=true
     * spring.jpa.properties.hibernate.format_sql=true
     * spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
     * 
     * Hibernate Configuration:
     * - ddl-auto: validate, update, create, create-drop
     * - show-sql: Print SQL queries to console
     * - format_sql: Format SQL output
     */
}
`;
}
/**
 * Security Configuration Template
 */
function getSecurityConfigTemplate() {
    return `package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration
 * Configures Spring Security with authentication and authorization
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Password encoder bean for encrypting passwords
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication manager bean
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * Security filter chain configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .permitAll()
            );

        return http.build();
    }
}
`;
}
/**
 * JWT Configuration Template
 */
function getJwtConfigTemplate() {
    return `package config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT (JSON Web Token) Configuration
 * Handles JWT token generation, validation, and extraction
 * 
 * Add to application.yml:
 * jwt:
 *   secret: your-secret-key-min-256-bits-long-for-security
 *   expiration: 86400000  # 24 hours in milliseconds
 */
@Component
public class JwtConfig {

    @Value("\${jwt.secret:default-secret-key-at-least-256-bits-long-for-hs512}")
    private String jwtSecret;

    @Value("\${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generate JWT token from username
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * Generate JWT token with custom claims
     */
    public String generateToken(String username, Map<String, Object> claims) {
        claims.put("sub", username);
        return createToken(claims, username);
    }

    /**
     * Create JWT token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }

    /**
     * Extract username from token
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * Extract claims from token
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        return getClaimsFromToken(token).getExpiration().before(new Date());
    }
}
`;
}
/**
 * CORS Configuration Template
 */
function getCorsConfigTemplate() {
    return `package config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Enables cross-origin requests from frontend applications
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Configure CORS mappings
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:3000",      // React dev server
                "http://localhost:4200",      // Angular dev server
                "http://localhost:8080"       // Vue dev server
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);

        // Alternative: Allow all origins (use with caution in production)
        // registry.addMapping("/api/**")
        //     .allowedOrigins("*")
        //     .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        //     .allowedHeaders("*")
        //     .maxAge(3600);
    }

    /*
     * Configuration can also be done via application.yml:
     * 
     * cors:
     *   allowedOrigins:
     *     - http://localhost:3000
     *     - http://localhost:4200
     *   allowedMethods: GET,POST,PUT,DELETE,OPTIONS,PATCH
     *   allowedHeaders: '*'
     *   allowCredentials: true
     *   maxAge: 3600
     */
}
`;
}
//# sourceMappingURL=configurationGenerator.js.map