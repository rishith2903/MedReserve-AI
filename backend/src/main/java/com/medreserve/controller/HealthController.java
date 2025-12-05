package com.medreserve.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/actuator")
@Tag(name = "Health", description = "Application health check APIs")
public class HealthController implements HealthIndicator {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check application health status")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> healthStatus = Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now(),
                "application", "MedReserve Backend",
                "version", "1.0.0",
                "environment", System.getProperty("java.version"),
                "uptime", getUptime()
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    @GetMapping("/ping")
    @Operation(summary = "Ping endpoint", description = "Simple ping endpoint for basic connectivity check")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = Map.of(
                "message", "pong",
                "timestamp", LocalDateTime.now(),
                "status", "healthy"
        );
        
        return ResponseEntity.ok(response);
    }

    @Override
    public Health health() {
        return Health.up()
                .withDetail("application", "MedReserve Backend")
                .withDetail("status", "Running")
                .withDetail("timestamp", LocalDateTime.now())
                .build();
    }

    private String getUptime() {
        long uptimeMillis = System.currentTimeMillis() - getStartTime();
        long seconds = uptimeMillis / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        
        return String.format("%d hours, %d minutes, %d seconds", 
                hours, minutes % 60, seconds % 60);
    }

    private long getStartTime() {
        // This is a simplified implementation
        // In a real application, you might want to store the start time
        return System.currentTimeMillis() - 
               java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
    }
}
