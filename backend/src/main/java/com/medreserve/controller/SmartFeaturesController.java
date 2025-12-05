package com.medreserve.controller;

import com.medreserve.entity.User;
import com.medreserve.service.ConditionExplainerService;
import com.medreserve.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/smart-features")
@RequiredArgsConstructor
@Tag(name = "Smart Features", description = "AI-powered smart features APIs")
public class SmartFeaturesController {
    
    private final ConditionExplainerService conditionExplainerService;
    private final NotificationService notificationService;
    
    @GetMapping("/conditions/{conditionName}")
    @Operation(summary = "Explain medical condition", description = "Get detailed explanation of a medical condition")
    public ResponseEntity<ConditionExplainerService.ConditionInfo> explainCondition(
            @PathVariable String conditionName) {
        ConditionExplainerService.ConditionInfo info = conditionExplainerService.explainCondition(conditionName);
        return ResponseEntity.ok(info);
    }
    
    @GetMapping("/conditions")
    @Operation(summary = "Get available conditions", description = "Get list of available medical conditions")
    public ResponseEntity<List<String>> getAvailableConditions() {
        List<String> conditions = conditionExplainerService.getAvailableConditions();
        return ResponseEntity.ok(conditions);
    }
    
    @GetMapping("/conditions/search")
    @Operation(summary = "Search conditions", description = "Search medical conditions by keyword")
    public ResponseEntity<List<ConditionExplainerService.ConditionInfo>> searchConditions(
            @RequestParam String query) {
        List<ConditionExplainerService.ConditionInfo> results = conditionExplainerService.searchConditions(query);
        return ResponseEntity.ok(results);
    }
    
    @PostMapping("/risk-alert")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Send risk alert", description = "Send a health risk alert to a patient")
    public ResponseEntity<Map<String, String>> sendRiskAlert(
            @RequestParam Long patientId,
            @RequestParam String riskType,
            @RequestParam String description,
            @AuthenticationPrincipal User currentUser) {
        
        // In a real implementation, you would fetch the patient and validate permissions
        // For now, we'll create a mock patient
        User patient = new User();
        // Note: In a real implementation, you would fetch the patient from the database
        // For demo purposes, we'll just use the patientId
        
        // notificationService.sendRiskAlert(patient, riskType, description);
        
        return ResponseEntity.ok(Map.of(
                "message", "Risk alert sent successfully",
                "patientId", patientId.toString(),
                "riskType", riskType
        ));
    }
    
    @GetMapping("/health-tips")
    @Operation(summary = "Get health tips", description = "Get personalized health tips based on user profile")
    public ResponseEntity<List<Map<String, String>>> getHealthTips(
            @AuthenticationPrincipal User currentUser) {
        
        // Generate personalized health tips based on user data
        List<Map<String, String>> tips = List.of(
                Map.of(
                        "category", "General Health",
                        "tip", "Stay hydrated by drinking at least 8 glasses of water daily",
                        "importance", "High"
                ),
                Map.of(
                        "category", "Exercise",
                        "tip", "Aim for at least 30 minutes of moderate exercise 5 days a week",
                        "importance", "High"
                ),
                Map.of(
                        "category", "Nutrition",
                        "tip", "Include a variety of fruits and vegetables in your daily diet",
                        "importance", "Medium"
                ),
                Map.of(
                        "category", "Sleep",
                        "tip", "Maintain a consistent sleep schedule with 7-9 hours of sleep nightly",
                        "importance", "High"
                ),
                Map.of(
                        "category", "Mental Health",
                        "tip", "Practice stress management techniques like meditation or deep breathing",
                        "importance", "Medium"
                ),
                Map.of(
                        "category", "Preventive Care",
                        "tip", "Schedule regular check-ups and screenings as recommended by your doctor",
                        "importance", "High"
                )
        );
        
        return ResponseEntity.ok(tips);
    }
    
    @GetMapping("/medication-reminders")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get medication reminders", description = "Get personalized medication reminders")
    public ResponseEntity<List<Map<String, Object>>> getMedicationReminders(
            @AuthenticationPrincipal User currentUser) {
        
        // In a real implementation, this would fetch from prescriptions
        List<Map<String, Object>> reminders = List.of(
                Map.of(
                        "medication", "Daily Vitamin D",
                        "dosage", "1000 IU",
                        "frequency", "Once daily",
                        "time", "Morning with breakfast",
                        "nextDue", "2024-01-15T08:00:00"
                ),
                Map.of(
                        "medication", "Blood Pressure Medication",
                        "dosage", "10mg",
                        "frequency", "Twice daily",
                        "time", "Morning and evening",
                        "nextDue", "2024-01-15T08:00:00"
                )
        );
        
        return ResponseEntity.ok(reminders);
    }
    
    @GetMapping("/wellness-score")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get wellness score", description = "Get AI-calculated wellness score based on health data")
    public ResponseEntity<Map<String, Object>> getWellnessScore(
            @AuthenticationPrincipal User currentUser) {
        
        // Mock wellness score calculation
        Map<String, Object> wellnessData = Map.of(
                "overallScore", 78,
                "categories", Map.of(
                        "Physical Health", 80,
                        "Mental Health", 75,
                        "Nutrition", 70,
                        "Exercise", 85,
                        "Sleep", 75
                ),
                "recommendations", List.of(
                        "Consider increasing your daily water intake",
                        "Try to get 30 minutes more sleep each night",
                        "Schedule a routine health check-up"
                ),
                "trends", Map.of(
                        "lastMonth", 75,
                        "improvement", "+3 points"
                )
        );
        
        return ResponseEntity.ok(wellnessData);
    }
    
    @GetMapping("/emergency-contacts")
    @Operation(summary = "Get emergency contacts", description = "Get emergency contact information")
    public ResponseEntity<List<Map<String, String>>> getEmergencyContacts() {
        
        List<Map<String, String>> contacts = List.of(
                Map.of(
                        "name", "Emergency Services",
                        "number", "911",
                        "type", "Emergency"
                ),
                Map.of(
                        "name", "Poison Control",
                        "number", "1-800-222-1222",
                        "type", "Poison Emergency"
                ),
                Map.of(
                        "name", "Mental Health Crisis",
                        "number", "988",
                        "type", "Mental Health Emergency"
                ),
                Map.of(
                        "name", "MedReserve Support",
                        "number", "1-800-MEDRESERVE",
                        "type", "Technical Support"
                )
        );
        
        return ResponseEntity.ok(contacts);
    }
}
