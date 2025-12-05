package com.medreserve.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/test")
@Tag(name = "Test", description = "Test endpoints for deployment verification")
public class TestController {

    @GetMapping
    @Operation(summary = "Test endpoint", description = "Simple test endpoint to verify API is working")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = Map.of(
                "message", "🎉 MedReserve API is working perfectly!",
                "status", "success",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0",
                "environment", "production"
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    @Operation(summary = "Ping endpoint", description = "Simple ping endpoint")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong ✅");
    }
}
