package com.medreserve.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medreserve.dto.SpecialtyPredictionResponse;
import com.medreserve.dto.SymptomAnalysisRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MLService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${ml.service.url:http://localhost:8001}")
    private String mlServiceUrl;
    
    @Retry(name = "mlService")
    @CircuitBreaker(name = "mlService")
    public SpecialtyPredictionResponse predictSpecialty(SymptomAnalysisRequest request, String jwtToken) {
        try {
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("symptoms", request.getSymptoms());
            if (request.getAge() != null) {
                requestBody.put("age", request.getAge());
            }
            if (request.getGender() != null) {
                requestBody.put("gender", request.getGender());
            }
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(jwtToken);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request to ML service
            ResponseEntity<SpecialtyPredictionResponse> response = restTemplate.exchange(
                    mlServiceUrl + "/predict-specialty",
                    HttpMethod.POST,
                    entity,
                    SpecialtyPredictionResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully predicted specialty for symptoms: {}", 
                        request.getSymptoms().substring(0, Math.min(50, request.getSymptoms().length())));
                return response.getBody();
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "ML service returned unexpected response");
            }
            
        } catch (Exception e) {
            log.error("Error calling ML service: {}", e.getMessage());
            
            // Return fallback response
            return createFallbackResponse(request.getSymptoms());
        }
    }

    // Fallback for predictSpecialty used by Resilience4j
    private SpecialtyPredictionResponse predictSpecialtyFallback(SymptomAnalysisRequest request, String jwtToken, Throwable t) {
        log.warn("predictSpecialtyFallback invoked due to: {}", t != null ? t.getMessage() : "unknown");
        return createFallbackResponse(request.getSymptoms());
    }
    
    @Cacheable(cacheNames = "mlSpecialties", key = "'specialties'")
    @Retry(name = "mlService")
    @CircuitBreaker(name = "mlService")
    public List<String> getAvailableSpecialties(String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(jwtToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    mlServiceUrl + "/specialties",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object specialtiesObj = body.get("specialties");
                if (specialtiesObj instanceof List<?>) {
                    @SuppressWarnings("unchecked")
                    List<String> specialties = (List<String>) specialtiesObj;
                    return specialties;
                }
            }
            
        } catch (Exception e) {
            log.error("Error getting specialties from ML service: {}", e.getMessage());
        }
        
        // Return default specialties
        return getDefaultSpecialties();
    }
    
    @Cacheable(cacheNames = "serviceHealth", key = "'ml'")
    @Retry(name = "mlHealth")
    @CircuitBreaker(name = "mlHealth")
    public boolean isMLServiceHealthy() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    mlServiceUrl + "/health",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.warn("ML service health check failed: {}", e.getMessage());
            return false;
        }
    }
    
    private SpecialtyPredictionResponse createFallbackResponse(String symptoms) {
        SpecialtyPredictionResponse response = new SpecialtyPredictionResponse();
        
        // Simple keyword-based fallback logic
        String recommendedSpecialty = determineFallbackSpecialty(symptoms.toLowerCase());
        
        SpecialtyPredictionResponse.SpecialtyPrediction prediction = 
                new SpecialtyPredictionResponse.SpecialtyPrediction();
        prediction.setSpecialty(recommendedSpecialty);
        prediction.setConfidence(0.5);
        prediction.setDescription("Fallback recommendation based on keyword matching");
        
        response.setPredictions(List.of(prediction));
        response.setRecommendedSpecialty(recommendedSpecialty);
        response.setConfidenceScore(0.5);
        response.setTimestamp(java.time.LocalDateTime.now());
        
        return response;
    }
    
    private String determineFallbackSpecialty(String symptoms) {
        if (symptoms.contains("heart") || symptoms.contains("chest") || symptoms.contains("cardiac")) {
            return "Cardiology";
        } else if (symptoms.contains("skin") || symptoms.contains("rash") || symptoms.contains("acne")) {
            return "Dermatology";
        } else if (symptoms.contains("stomach") || symptoms.contains("abdominal") || symptoms.contains("nausea")) {
            return "Gastroenterology";
        } else if (symptoms.contains("headache") || symptoms.contains("migraine") || symptoms.contains("neurological")) {
            return "Neurology";
        } else if (symptoms.contains("bone") || symptoms.contains("joint") || symptoms.contains("back pain")) {
            return "Orthopedics";
        } else if (symptoms.contains("depression") || symptoms.contains("anxiety") || symptoms.contains("mental")) {
            return "Psychiatry";
        } else if (symptoms.contains("cough") || symptoms.contains("breathing") || symptoms.contains("lung")) {
            return "Pulmonology";
        } else if (symptoms.contains("urinary") || symptoms.contains("kidney") || symptoms.contains("bladder")) {
            return "Urology";
        } else if (symptoms.contains("eye") || symptoms.contains("vision") || symptoms.contains("sight")) {
            return "Ophthalmology";
        } else if (symptoms.contains("ear") || symptoms.contains("throat") || symptoms.contains("hearing")) {
            return "ENT";
        } else {
            return "General Medicine";
        }
    }
    
    private List<String> getDefaultSpecialties() {
        return List.of(
                "Cardiology",
                "Dermatology", 
                "Endocrinology",
                "Gastroenterology",
                "Neurology",
                "Orthopedics",
                "Psychiatry",
                "Pulmonology",
                "Urology",
                "Gynecology",
                "Ophthalmology",
                "ENT",
                "General Medicine",
                "Emergency Medicine"
        );
    }
}
