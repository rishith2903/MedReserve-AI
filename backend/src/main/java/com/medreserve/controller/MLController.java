package com.medreserve.controller;

import com.medreserve.dto.SpecialtyPredictionResponse;
import com.medreserve.dto.SymptomAnalysisRequest;
import com.medreserve.entity.User;
import com.medreserve.service.MLService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/ml")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Machine Learning", description = "ML-powered medical analysis APIs")
public class MLController {

    private final MLService mlService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.api.url:http://localhost:5001}")
    private String mlApiUrl;
    
    @PostMapping("/predict-specialty")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Predict medical specialty", description = "Predict recommended medical specialty based on symptoms")
    public ResponseEntity<SpecialtyPredictionResponse> predictSpecialty(
            @Valid @RequestBody SymptomAnalysisRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        
        // Extract JWT token from request
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        SpecialtyPredictionResponse response = mlService.predictSpecialty(request, jwtToken);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/specialties")
    @Operation(summary = "Get available specialties", description = "Get list of available medical specialties")
    public ResponseEntity<List<String>> getAvailableSpecialties(
            HttpServletRequest httpRequest) {
        
        // Extract JWT token from request
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        List<String> specialties = mlService.getAvailableSpecialties(jwtToken);
        return ResponseEntity.ok(specialties);
    }
    
    @GetMapping("/health")
    @Operation(summary = "ML service health", description = "Check ML service health status")
    public ResponseEntity<Map<String, Object>> getMLServiceHealth() {
        boolean isHealthy = mlService.isMLServiceHealthy();

        Map<String, Object> response = Map.of(
                "ml_service_healthy", isHealthy,
                "status", isHealthy ? "UP" : "DOWN",
                "timestamp", java.time.LocalDateTime.now()
        );

        return ResponseEntity.ok(response);
    }

    // New ML API Integration Endpoints

    @PostMapping("/predict/patient-specialization")
    @Operation(summary = "Predict doctor specializations for patients", description = "Predict recommended doctor specializations based on patient symptoms using ML models")
    public ResponseEntity<Map<String, Object>> predictPatientSpecialization(@RequestBody Map<String, Object> request) {
        try {
            log.info("Predicting specialization for patient symptoms: {}", request.get("symptoms"));

            // Validate input
            if (!request.containsKey("symptoms") || request.get("symptoms") == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required field: symptoms"
                ));
            }

            String symptoms = request.get("symptoms").toString().trim();
            if (symptoms.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Symptoms cannot be empty"
                ));
            }

            int topK = (Integer) request.getOrDefault("top_k", 3);
            // Use internal fallback logic directly
            return getFallbackSpecializationPrediction(symptoms, topK);

        } catch (Exception e) {
            log.error("Error in specialization prediction: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal server error",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/predict/doctor-diagnosis")
    @Operation(summary = "Predict diseases and medicines for doctors", description = "Predict possible diseases and associated medicines based on doctor-entered symptoms using ML models")
    public ResponseEntity<Map<String, Object>> predictDoctorDiagnosis(@RequestBody Map<String, Object> request) {
        try {
            log.info("Predicting diagnosis for doctor symptoms: {}", request.get("symptoms"));

            // Validate input
            if (!request.containsKey("symptoms") || request.get("symptoms") == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required field: symptoms"
                ));
            }

            String symptoms = request.get("symptoms").toString().trim();
            if (symptoms.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Symptoms cannot be empty"
                ));
            }

            int topDiseases = (Integer) request.getOrDefault("top_diseases", 5);
            int topMedicines = (Integer) request.getOrDefault("top_medicines", 5);
            // Use internal fallback logic directly
            return getFallbackDiagnosisPrediction(symptoms, topDiseases, topMedicines);

        } catch (Exception e) {
            log.error("Error in diagnosis prediction: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal server error",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/api-health")
    @Operation(summary = "Check ML API health", description = "Check the health status of the external ML API")
    public ResponseEntity<Map<String, Object>> checkMLAPIHealth() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                mlApiUrl + "/health",
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.status(response.getStatusCode()).body(Map.of(
                    "status", "unhealthy",
                    "message", "ML API returned error status"
                ));
            }

        } catch (Exception e) {
            log.warn("ML API health check failed: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "unavailable",
                "message", "ML API not accessible",
                "fallback", "enabled"
            ));
        }
    }

    // Fallback prediction methods

    private ResponseEntity<Map<String, Object>> getFallbackSpecializationPrediction(String symptoms, int topK) {
        log.info("Using fallback specialization prediction");

        String symptomsLower = symptoms.toLowerCase();
        Map<String, Double> specializationScores = new HashMap<>();

        // Initialize scores
        specializationScores.put("Internal Medicine", 1.0);
        specializationScores.put("Cardiology", 0.0);
        specializationScores.put("Neurology", 0.0);
        specializationScores.put("Pulmonology", 0.0);
        specializationScores.put("Gastroenterology", 0.0);
        specializationScores.put("Dermatology", 0.0);
        specializationScores.put("Orthopedics", 0.0);
        specializationScores.put("Psychiatry", 0.0);

        // Score based on keywords
        if (symptomsLower.contains("chest pain") || symptomsLower.contains("heart") || symptomsLower.contains("cardiac")) {
            specializationScores.put("Cardiology", 3.0);
        }
        if (symptomsLower.contains("headache") || symptomsLower.contains("migraine") || symptomsLower.contains("seizure")) {
            specializationScores.put("Neurology", 3.0);
        }
        if (symptomsLower.contains("breathing") || symptomsLower.contains("cough") || symptomsLower.contains("asthma")) {
            specializationScores.put("Pulmonology", 3.0);
        }
        if (symptomsLower.contains("stomach") || symptomsLower.contains("abdominal") || symptomsLower.contains("nausea")) {
            specializationScores.put("Gastroenterology", 3.0);
        }
        if (symptomsLower.contains("skin") || symptomsLower.contains("rash") || symptomsLower.contains("eczema")) {
            specializationScores.put("Dermatology", 3.0);
        }
        if (symptomsLower.contains("joint") || symptomsLower.contains("bone") || symptomsLower.contains("back pain")) {
            specializationScores.put("Orthopedics", 3.0);
        }
        if (symptomsLower.contains("depression") || symptomsLower.contains("anxiety") || symptomsLower.contains("mental")) {
            specializationScores.put("Psychiatry", 3.0);
        }

        // Sort and get top K
        List<Map<String, Object>> specializations = new ArrayList<>();
        specializationScores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(topK)
            .forEach(entry -> {
                if (entry.getValue() > 0) {
                    double confidence = Math.min(entry.getValue() / 5.0, 1.0);
                    specializations.add(Map.of(
                        "specialization", entry.getKey(),
                        "confidence", confidence,
                        "percentage", confidence * 100
                    ));
                }
            });

        // If no specific matches, recommend Internal Medicine
        if (specializations.isEmpty()) {
            specializations.add(Map.of(
                "specialization", "Internal Medicine",
                "confidence", 0.7,
                "percentage", 70.0
            ));
        }

        return ResponseEntity.ok(Map.of(
            "specializations", specializations,
            "confidence", specializations.isEmpty() ? 0.0 : ((Map<String, Object>) specializations.get(0)).get("confidence"),
            "processed_symptoms", symptomsLower,
            "model_version", "fallback_v1.0",
            "note", "Using rule-based fallback prediction"
        ));
    }

    private ResponseEntity<Map<String, Object>> getFallbackDiagnosisPrediction(String symptoms, int topDiseases, int topMedicines) {
        log.info("Using fallback diagnosis prediction");

        String symptomsLower = symptoms.toLowerCase();

        // Simple rule-based disease prediction
        List<Map<String, Object>> diseases = new ArrayList<>();
        List<Map<String, Object>> medicines = new ArrayList<>();

        if (symptomsLower.contains("chest pain")) {
            diseases.add(Map.of("disease", "angina", "confidence", 0.8, "percentage", 80.0));
            diseases.add(Map.of("disease", "heart attack", "confidence", 0.6, "percentage", 60.0));
            medicines.add(Map.of("medicine", "aspirin", "confidence", 0.9, "percentage", 90.0));
            medicines.add(Map.of("medicine", "nitroglycerin", "confidence", 0.7, "percentage", 70.0));
        } else if (symptomsLower.contains("headache")) {
            diseases.add(Map.of("disease", "migraine", "confidence", 0.7, "percentage", 70.0));
            diseases.add(Map.of("disease", "tension headache", "confidence", 0.6, "percentage", 60.0));
            medicines.add(Map.of("medicine", "ibuprofen", "confidence", 0.8, "percentage", 80.0));
            medicines.add(Map.of("medicine", "acetaminophen", "confidence", 0.7, "percentage", 70.0));
        } else if (symptomsLower.contains("fever")) {
            diseases.add(Map.of("disease", "viral infection", "confidence", 0.6, "percentage", 60.0));
            diseases.add(Map.of("disease", "bacterial infection", "confidence", 0.5, "percentage", 50.0));
            medicines.add(Map.of("medicine", "acetaminophen", "confidence", 0.8, "percentage", 80.0));
            medicines.add(Map.of("medicine", "ibuprofen", "confidence", 0.7, "percentage", 70.0));
        } else {
            diseases.add(Map.of("disease", "common cold", "confidence", 0.5, "percentage", 50.0));
            medicines.add(Map.of("medicine", "rest and fluids", "confidence", 0.8, "percentage", 80.0));
        }

        return ResponseEntity.ok(Map.of(
            "diseases", diseases.subList(0, Math.min(diseases.size(), topDiseases)),
            "medicines", medicines.subList(0, Math.min(medicines.size(), topMedicines)),
            "confidence", diseases.isEmpty() ? 0.0 : ((Map<String, Object>) diseases.get(0)).get("confidence"),
            "processed_symptoms", symptomsLower,
            "model_version", "fallback_v1.0",
            "note", "Using rule-based fallback prediction"
        ));
    }
}
