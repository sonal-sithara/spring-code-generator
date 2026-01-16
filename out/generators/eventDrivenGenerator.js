"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventDrivenComponent = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const fileUtils_1 = require("../utils/fileUtils");
async function createEventDrivenComponent(uri) {
    try {
        const folderPath = uri ? uri.fsPath : undefined;
        if (!folderPath) {
            vscode.window.showErrorMessage("Please select a folder first!");
            return;
        }
        // Select messaging system
        const messagingType = await vscode.window.showQuickPick([
            { label: "Kafka", description: "Apache Kafka event streaming" },
            { label: "RabbitMQ", description: "RabbitMQ message broker" },
        ], {
            placeHolder: "Select messaging system",
            ignoreFocusOut: true,
        });
        if (!messagingType) {
            return;
        }
        // Select component type
        const componentType = await vscode.window.showQuickPick([
            { label: "Producer", description: "Sends messages/events" },
            { label: "Consumer", description: "Receives messages/events" },
            { label: "Both", description: "Producer and Consumer" },
        ], {
            placeHolder: "Select component type",
            ignoreFocusOut: true,
        });
        if (!componentType) {
            return;
        }
        const config = {
            messagingType: messagingType.label,
            componentType: componentType.label,
            topicOrQueue: "",
        };
        // Get topic/queue name
        const topicLabel = messagingType.label === "Kafka" ? "topic" : "queue";
        config.topicOrQueue = await vscode.window.showInputBox({
            prompt: `Enter ${topicLabel} name`,
            placeHolder: `user-events, order-notifications`,
            ignoreFocusOut: true,
        }) || "";
        if (componentType.label === "Consumer" || componentType.label === "Both") {
            config.groupId = await vscode.window.showInputBox({
                prompt: "Enter consumer group ID",
                placeHolder: "user-service-group",
                ignoreFocusOut: true,
            }) || "";
        }
        config.messageType = await vscode.window.showInputBox({
            prompt: "Enter message/event class name",
            placeHolder: "UserEvent, OrderMessage",
            ignoreFocusOut: true,
        }) || "Message";
        // Generate components
        const files = generateEventDrivenComponents(config, folderPath);
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
        vscode.window.showInformationMessage(`✅ ${messagingType.label} ${componentType.label} created with ${files.length} file(s)!`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to create event-driven component: ${error.message}`);
    }
}
exports.createEventDrivenComponent = createEventDrivenComponent;
function generateEventDrivenComponents(config, folderPath) {
    if (config.messagingType === "Kafka") {
        return generateKafkaComponents(config, folderPath);
    }
    else {
        return generateRabbitMQComponents(config, folderPath);
    }
}
function generateKafkaComponents(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    const files = [];
    // Message/Event class
    let messageContent = `package ${packageName};\n\n`;
    messageContent += `import java.time.LocalDateTime;\n`;
    messageContent += `import java.io.Serializable;\n\n`;
    messageContent += `/**\n`;
    messageContent += ` * Message/Event class for Kafka\n`;
    messageContent += ` */\n`;
    messageContent += `public class ${config.messageType} implements Serializable {\n\n`;
    messageContent += `    private String id;\n`;
    messageContent += `    private String eventType;\n`;
    messageContent += `    private Object data;\n`;
    messageContent += `    private LocalDateTime timestamp;\n\n`;
    messageContent += `    public ${config.messageType}() {\n`;
    messageContent += `        this.timestamp = LocalDateTime.now();\n`;
    messageContent += `    }\n\n`;
    messageContent += `    // Getters and Setters\n`;
    messageContent += `    public String getId() { return id; }\n`;
    messageContent += `    public void setId(String id) { this.id = id; }\n\n`;
    messageContent += `    public String getEventType() { return eventType; }\n`;
    messageContent += `    public void setEventType(String eventType) { this.eventType = eventType; }\n\n`;
    messageContent += `    public Object getData() { return data; }\n`;
    messageContent += `    public void setData(Object data) { this.data = data; }\n\n`;
    messageContent += `    public LocalDateTime getTimestamp() { return timestamp; }\n`;
    messageContent += `    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }\n`;
    messageContent += `}\n`;
    files.push({ name: `${config.messageType}.java`, content: messageContent });
    // Producer
    if (config.componentType === "Producer" || config.componentType === "Both") {
        let producerContent = `package ${packageName};\n\n`;
        producerContent += `import org.springframework.kafka.core.KafkaTemplate;\n`;
        producerContent += `import org.springframework.kafka.support.SendResult;\n`;
        producerContent += `import org.springframework.stereotype.Service;\n`;
        producerContent += `import org.slf4j.Logger;\n`;
        producerContent += `import org.slf4j.LoggerFactory;\n`;
        producerContent += `import java.util.concurrent.CompletableFuture;\n\n`;
        producerContent += `/**\n`;
        producerContent += ` * Kafka Producer Service\n`;
        producerContent += ` * Sends messages to Kafka topic: ${config.topicOrQueue}\n`;
        producerContent += ` */\n`;
        producerContent += `@Service\n`;
        producerContent += `public class KafkaProducerService {\n\n`;
        producerContent += `    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);\n`;
        producerContent += `    private static final String TOPIC = "${config.topicOrQueue}";\n\n`;
        producerContent += `    private final KafkaTemplate<String, ${config.messageType}> kafkaTemplate;\n\n`;
        producerContent += `    public KafkaProducerService(KafkaTemplate<String, ${config.messageType}> kafkaTemplate) {\n`;
        producerContent += `        this.kafkaTemplate = kafkaTemplate;\n`;
        producerContent += `    }\n\n`;
        producerContent += `    public void sendMessage(${config.messageType} message) {\n`;
        producerContent += `        logger.info("Sending message to topic: {}", TOPIC);\n`;
        producerContent += `        \n`;
        producerContent += `        CompletableFuture<SendResult<String, ${config.messageType}>> future = \n`;
        producerContent += `            kafkaTemplate.send(TOPIC, message.getId(), message);\n\n`;
        producerContent += `        future.whenComplete((result, ex) -> {\n`;
        producerContent += `            if (ex == null) {\n`;
        producerContent += `                logger.info("Message sent successfully: offset={}, partition={}",\n`;
        producerContent += `                    result.getRecordMetadata().offset(),\n`;
        producerContent += `                    result.getRecordMetadata().partition());\n`;
        producerContent += `            } else {\n`;
        producerContent += `                logger.error("Failed to send message", ex);\n`;
        producerContent += `            }\n`;
        producerContent += `        });\n`;
        producerContent += `    }\n`;
        producerContent += `}\n`;
        files.push({ name: "KafkaProducerService.java", content: producerContent });
    }
    // Consumer
    if (config.componentType === "Consumer" || config.componentType === "Both") {
        let consumerContent = `package ${packageName};\n\n`;
        consumerContent += `import org.springframework.kafka.annotation.KafkaListener;\n`;
        consumerContent += `import org.springframework.kafka.support.KafkaHeaders;\n`;
        consumerContent += `import org.springframework.messaging.handler.annotation.Header;\n`;
        consumerContent += `import org.springframework.messaging.handler.annotation.Payload;\n`;
        consumerContent += `import org.springframework.stereotype.Service;\n`;
        consumerContent += `import org.slf4j.Logger;\n`;
        consumerContent += `import org.slf4j.LoggerFactory;\n\n`;
        consumerContent += `/**\n`;
        consumerContent += ` * Kafka Consumer Service\n`;
        consumerContent += ` * Listens to Kafka topic: ${config.topicOrQueue}\n`;
        consumerContent += ` */\n`;
        consumerContent += `@Service\n`;
        consumerContent += `public class KafkaConsumerService {\n\n`;
        consumerContent += `    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);\n\n`;
        consumerContent += `    @KafkaListener(\n`;
        consumerContent += `        topics = "${config.topicOrQueue}",\n`;
        consumerContent += `        groupId = "${config.groupId || 'default-group'}"\n`;
        consumerContent += `    )\n`;
        consumerContent += `    public void consume(\n`;
        consumerContent += `            @Payload ${config.messageType} message,\n`;
        consumerContent += `            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,\n`;
        consumerContent += `            @Header(KafkaHeaders.OFFSET) long offset) {\n\n`;
        consumerContent += `        logger.info("Received message from partition: {}, offset: {}", partition, offset);\n`;
        consumerContent += `        logger.info("Message content: {}", message);\n\n`;
        consumerContent += `        try {\n`;
        consumerContent += `            // Process the message\n`;
        consumerContent += `            processMessage(message);\n`;
        consumerContent += `        } catch (Exception e) {\n`;
        consumerContent += `            logger.error("Error processing message", e);\n`;
        consumerContent += `            // Handle error (retry, send to DLQ, etc.)\n`;
        consumerContent += `        }\n`;
        consumerContent += `    }\n\n`;
        consumerContent += `    private void processMessage(${config.messageType} message) {\n`;
        consumerContent += `        // TODO: Implement message processing logic\n`;
        consumerContent += `        logger.info("Processing message: {}", message.getId());\n`;
        consumerContent += `    }\n`;
        consumerContent += `}\n`;
        files.push({ name: "KafkaConsumerService.java", content: consumerContent });
    }
    // Kafka Configuration
    let configContent = `package ${packageName};\n\n`;
    configContent += `import org.apache.kafka.clients.consumer.ConsumerConfig;\n`;
    configContent += `import org.apache.kafka.clients.producer.ProducerConfig;\n`;
    configContent += `import org.apache.kafka.common.serialization.StringDeserializer;\n`;
    configContent += `import org.apache.kafka.common.serialization.StringSerializer;\n`;
    configContent += `import org.springframework.beans.factory.annotation.Value;\n`;
    configContent += `import org.springframework.context.annotation.Bean;\n`;
    configContent += `import org.springframework.context.annotation.Configuration;\n`;
    configContent += `import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;\n`;
    configContent += `import org.springframework.kafka.core.*;\n`;
    configContent += `import org.springframework.kafka.support.serializer.JsonDeserializer;\n`;
    configContent += `import org.springframework.kafka.support.serializer.JsonSerializer;\n`;
    configContent += `import java.util.HashMap;\n`;
    configContent += `import java.util.Map;\n\n`;
    configContent += `/**\n`;
    configContent += ` * Kafka Configuration\n`;
    configContent += ` */\n`;
    configContent += `@Configuration\n`;
    configContent += `public class KafkaConfig {\n\n`;
    configContent += `    @Value("\${spring.kafka.bootstrap-servers:localhost:9092}")\n`;
    configContent += `    private String bootstrapServers;\n\n`;
    // Producer Config
    configContent += `    @Bean\n`;
    configContent += `    public ProducerFactory<String, ${config.messageType}> producerFactory() {\n`;
    configContent += `        Map<String, Object> configProps = new HashMap<>();\n`;
    configContent += `        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);\n`;
    configContent += `        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);\n`;
    configContent += `        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);\n`;
    configContent += `        return new DefaultKafkaProducerFactory<>(configProps);\n`;
    configContent += `    }\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public KafkaTemplate<String, ${config.messageType}> kafkaTemplate() {\n`;
    configContent += `        return new KafkaTemplate<>(producerFactory());\n`;
    configContent += `    }\n\n`;
    // Consumer Config
    configContent += `    @Bean\n`;
    configContent += `    public ConsumerFactory<String, ${config.messageType}> consumerFactory() {\n`;
    configContent += `        Map<String, Object> configProps = new HashMap<>();\n`;
    configContent += `        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);\n`;
    configContent += `        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "${config.groupId || 'default-group'}");\n`;
    configContent += `        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);\n`;
    configContent += `        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);\n`;
    configContent += `        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "*");\n`;
    configContent += `        return new DefaultKafkaConsumerFactory<>(configProps, new StringDeserializer(),\n`;
    configContent += `            new JsonDeserializer<>(${config.messageType}.class));\n`;
    configContent += `    }\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public ConcurrentKafkaListenerContainerFactory<String, ${config.messageType}> kafkaListenerContainerFactory() {\n`;
    configContent += `        ConcurrentKafkaListenerContainerFactory<String, ${config.messageType}> factory =\n`;
    configContent += `            new ConcurrentKafkaListenerContainerFactory<>();\n`;
    configContent += `        factory.setConsumerFactory(consumerFactory());\n`;
    configContent += `        return factory;\n`;
    configContent += `    }\n`;
    configContent += `}\n`;
    files.push({ name: "KafkaConfig.java", content: configContent });
    // application.yml
    let ymlContent = `# Kafka Configuration\n`;
    ymlContent += `spring:\n`;
    ymlContent += `  kafka:\n`;
    ymlContent += `    bootstrap-servers: localhost:9092\n`;
    ymlContent += `    consumer:\n`;
    ymlContent += `      group-id: ${config.groupId || 'default-group'}\n`;
    ymlContent += `      auto-offset-reset: earliest\n`;
    ymlContent += `      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer\n`;
    ymlContent += `      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer\n`;
    ymlContent += `      properties:\n`;
    ymlContent += `        spring.json.trusted.packages: "*"\n`;
    ymlContent += `    producer:\n`;
    ymlContent += `      key-serializer: org.apache.kafka.common.serialization.StringSerializer\n`;
    ymlContent += `      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer\n\n`;
    ymlContent += `# Topic: ${config.topicOrQueue}\n`;
    files.push({ name: "application-kafka.yml", content: ymlContent });
    return files;
}
function generateRabbitMQComponents(config, folderPath) {
    const packageName = (0, fileUtils_1.extractPackageName)(folderPath);
    const files = [];
    // Message class (same as Kafka)
    let messageContent = `package ${packageName};\n\n`;
    messageContent += `import java.time.LocalDateTime;\n`;
    messageContent += `import java.io.Serializable;\n\n`;
    messageContent += `/**\n`;
    messageContent += ` * Message class for RabbitMQ\n`;
    messageContent += ` */\n`;
    messageContent += `public class ${config.messageType} implements Serializable {\n\n`;
    messageContent += `    private String id;\n`;
    messageContent += `    private String messageType;\n`;
    messageContent += `    private Object data;\n`;
    messageContent += `    private LocalDateTime timestamp;\n\n`;
    messageContent += `    public ${config.messageType}() {\n`;
    messageContent += `        this.timestamp = LocalDateTime.now();\n`;
    messageContent += `    }\n\n`;
    messageContent += `    // Getters and Setters\n`;
    messageContent += `    public String getId() { return id; }\n`;
    messageContent += `    public void setId(String id) { this.id = id; }\n\n`;
    messageContent += `    public String getMessageType() { return messageType; }\n`;
    messageContent += `    public void setMessageType(String messageType) { this.messageType = messageType; }\n\n`;
    messageContent += `    public Object getData() { return data; }\n`;
    messageContent += `    public void setData(Object data) { this.data = data; }\n\n`;
    messageContent += `    public LocalDateTime getTimestamp() { return timestamp; }\n`;
    messageContent += `    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }\n`;
    messageContent += `}\n`;
    files.push({ name: `${config.messageType}.java`, content: messageContent });
    // Producer
    if (config.componentType === "Producer" || config.componentType === "Both") {
        let producerContent = `package ${packageName};\n\n`;
        producerContent += `import org.springframework.amqp.rabbit.core.RabbitTemplate;\n`;
        producerContent += `import org.springframework.stereotype.Service;\n`;
        producerContent += `import org.slf4j.Logger;\n`;
        producerContent += `import org.slf4j.LoggerFactory;\n\n`;
        producerContent += `/**\n`;
        producerContent += ` * RabbitMQ Producer Service\n`;
        producerContent += ` * Sends messages to queue: ${config.topicOrQueue}\n`;
        producerContent += ` */\n`;
        producerContent += `@Service\n`;
        producerContent += `public class RabbitMQProducerService {\n\n`;
        producerContent += `    private static final Logger logger = LoggerFactory.getLogger(RabbitMQProducerService.class);\n`;
        producerContent += `    private static final String QUEUE_NAME = "${config.topicOrQueue}";\n\n`;
        producerContent += `    private final RabbitTemplate rabbitTemplate;\n\n`;
        producerContent += `    public RabbitMQProducerService(RabbitTemplate rabbitTemplate) {\n`;
        producerContent += `        this.rabbitTemplate = rabbitTemplate;\n`;
        producerContent += `    }\n\n`;
        producerContent += `    public void sendMessage(${config.messageType} message) {\n`;
        producerContent += `        logger.info("Sending message to queue: {}", QUEUE_NAME);\n`;
        producerContent += `        rabbitTemplate.convertAndSend(QUEUE_NAME, message);\n`;
        producerContent += `        logger.info("Message sent successfully");\n`;
        producerContent += `    }\n`;
        producerContent += `}\n`;
        files.push({ name: "RabbitMQProducerService.java", content: producerContent });
    }
    // Consumer
    if (config.componentType === "Consumer" || config.componentType === "Both") {
        let consumerContent = `package ${packageName};\n\n`;
        consumerContent += `import org.springframework.amqp.rabbit.annotation.RabbitListener;\n`;
        consumerContent += `import org.springframework.stereotype.Service;\n`;
        consumerContent += `import org.slf4j.Logger;\n`;
        consumerContent += `import org.slf4j.LoggerFactory;\n\n`;
        consumerContent += `/**\n`;
        consumerContent += ` * RabbitMQ Consumer Service\n`;
        consumerContent += ` * Listens to queue: ${config.topicOrQueue}\n`;
        consumerContent += ` */\n`;
        consumerContent += `@Service\n`;
        consumerContent += `public class RabbitMQConsumerService {\n\n`;
        consumerContent += `    private static final Logger logger = LoggerFactory.getLogger(RabbitMQConsumerService.class);\n\n`;
        consumerContent += `    @RabbitListener(queues = "${config.topicOrQueue}")\n`;
        consumerContent += `    public void consume(${config.messageType} message) {\n`;
        consumerContent += `        logger.info("Received message: {}", message);\n\n`;
        consumerContent += `        try {\n`;
        consumerContent += `            // Process the message\n`;
        consumerContent += `            processMessage(message);\n`;
        consumerContent += `        } catch (Exception e) {\n`;
        consumerContent += `            logger.error("Error processing message", e);\n`;
        consumerContent += `            // Handle error (retry, send to DLQ, etc.)\n`;
        consumerContent += `        }\n`;
        consumerContent += `    }\n\n`;
        consumerContent += `    private void processMessage(${config.messageType} message) {\n`;
        consumerContent += `        // TODO: Implement message processing logic\n`;
        consumerContent += `        logger.info("Processing message: {}", message.getId());\n`;
        consumerContent += `    }\n`;
        consumerContent += `}\n`;
        files.push({ name: "RabbitMQConsumerService.java", content: consumerContent });
    }
    // RabbitMQ Configuration
    let configContent = `package ${packageName};\n\n`;
    configContent += `import org.springframework.amqp.core.*;\n`;
    configContent += `import org.springframework.amqp.rabbit.connection.ConnectionFactory;\n`;
    configContent += `import org.springframework.amqp.rabbit.core.RabbitTemplate;\n`;
    configContent += `import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;\n`;
    configContent += `import org.springframework.amqp.support.converter.MessageConverter;\n`;
    configContent += `import org.springframework.context.annotation.Bean;\n`;
    configContent += `import org.springframework.context.annotation.Configuration;\n\n`;
    configContent += `/**\n`;
    configContent += ` * RabbitMQ Configuration\n`;
    configContent += ` */\n`;
    configContent += `@Configuration\n`;
    configContent += `public class RabbitMQConfig {\n\n`;
    configContent += `    public static final String QUEUE_NAME = "${config.topicOrQueue}";\n`;
    configContent += `    public static final String EXCHANGE_NAME = "${config.topicOrQueue}-exchange";\n`;
    configContent += `    public static final String ROUTING_KEY = "${config.topicOrQueue}-routing-key";\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public Queue queue() {\n`;
    configContent += `        return new Queue(QUEUE_NAME, true); // durable queue\n`;
    configContent += `    }\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public TopicExchange exchange() {\n`;
    configContent += `        return new TopicExchange(EXCHANGE_NAME);\n`;
    configContent += `    }\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public Binding binding(Queue queue, TopicExchange exchange) {\n`;
    configContent += `        return BindingBuilder\n`;
    configContent += `            .bind(queue)\n`;
    configContent += `            .to(exchange)\n`;
    configContent += `            .with(ROUTING_KEY);\n`;
    configContent += `    }\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public MessageConverter jsonMessageConverter() {\n`;
    configContent += `        return new Jackson2JsonMessageConverter();\n`;
    configContent += `    }\n\n`;
    configContent += `    @Bean\n`;
    configContent += `    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {\n`;
    configContent += `        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);\n`;
    configContent += `        rabbitTemplate.setMessageConverter(jsonMessageConverter());\n`;
    configContent += `        return rabbitTemplate;\n`;
    configContent += `    }\n`;
    configContent += `}\n`;
    files.push({ name: "RabbitMQConfig.java", content: configContent });
    // application.yml
    let ymlContent = `# RabbitMQ Configuration\n`;
    ymlContent += `spring:\n`;
    ymlContent += `  rabbitmq:\n`;
    ymlContent += `    host: localhost\n`;
    ymlContent += `    port: 5672\n`;
    ymlContent += `    username: guest\n`;
    ymlContent += `    password: guest\n`;
    ymlContent += `    listener:\n`;
    ymlContent += `      simple:\n`;
    ymlContent += `        acknowledge-mode: auto\n`;
    ymlContent += `        retry:\n`;
    ymlContent += `          enabled: true\n`;
    ymlContent += `          initial-interval: 1000\n`;
    ymlContent += `          max-attempts: 3\n`;
    ymlContent += `          multiplier: 2\n\n`;
    ymlContent += `# Queue: ${config.topicOrQueue}\n`;
    files.push({ name: "application-rabbitmq.yml", content: ymlContent });
    return files;
}
//# sourceMappingURL=eventDrivenGenerator.js.map