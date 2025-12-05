package com.medreserve.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @GetMapping("/env")
    public ResponseEntity<Map<String, Object>> getEnvironmentInfo() {
        Map<String, Object> response = new HashMap<>();
        
        // Get CORS environment variable
        String corsOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
        response.put("CORS_ALLOWED_ORIGINS", corsOrigins);
        
        // Get other relevant env vars
        response.put("PORT", System.getenv("PORT"));
        response.put("SPRING_PROFILES_ACTIVE", System.getenv("SPRING_PROFILES_ACTIVE"));
        
        // System properties
        response.put("java.version", System.getProperty("java.version"));
        response.put("spring.profiles.active", System.getProperty("spring.profiles.active"));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cors-test")
    public ResponseEntity<Map<String, Object>> corsTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CORS debug test successful");
        response.put("timestamp", System.currentTimeMillis());
        response.put("server", "medreserve-backend");
        return ResponseEntity.ok(response);
    }
}
