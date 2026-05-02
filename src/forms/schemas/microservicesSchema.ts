import { FormSchema } from "../types";

export const microservicesSchema: FormSchema = {
  title: "Create Microservice Component",
  fields: [
    {
      kind: "select",
      name: "componentType",
      label: "Component Type",
      options: [
        { value: "FeignClient", label: "Feign Client", description: "REST client for inter-service communication" },
        { value: "ServiceDiscovery", label: "Service Discovery (Eureka)", description: "Eureka server configuration" },
        { value: "ConfigClient", label: "Config Client", description: "Spring Cloud Config client setup" },
        { value: "CircuitBreaker", label: "Circuit Breaker", description: "Resilience4j circuit breaker" },
        { value: "ApiGateway", label: "API Gateway", description: "Spring Cloud Gateway configuration" },
      ],
      default: "FeignClient",
      required: true,
    },
    {
      kind: "text",
      name: "serviceName",
      label: "Target Service Name",
      placeholder: "user-service, product-service",
      showWhen: { field: "componentType", equals: "FeignClient" },
      required: true,
    },
    {
      kind: "text",
      name: "serviceUrl",
      label: "Service URL (optional)",
      placeholder: "http://localhost:8081",
      showWhen: { field: "componentType", equals: "FeignClient" },
    },
    {
      kind: "checkbox",
      name: "includeFallback",
      label: "Include fallback class for circuit breaker",
      showWhen: { field: "componentType", equals: "FeignClient" },
    },
  ],
};
