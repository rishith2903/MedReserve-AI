package com.medreserve.controller;

import com.medreserve.dto.*;
import com.medreserve.entity.User;
import com.medreserve.service.DiseasePredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/disease-prediction")
@RequiredArgsConstructor
@Tag(name = "Disease Prediction", description = "AI-powered disease prediction from symptoms using ML and DL models")
public class DiseasePredictionController {
    
    private final DiseasePredictionService diseasePredictionService;
    
    @PostMapping("/predict")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Predict disease from symptoms", 
               description = "Predict disease using ensemble of ML and DL models based on symptom description")
    public ResponseEntity<DiseasePredictionResponse> predictDisease(
            @Valid @RequestBody DiseasePredictionRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        
        // Extract JWT token from request
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        DiseasePredictionResponse response = diseasePredictionService.predictDisease(request, jwtToken);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/predict/ml")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Predict disease using ML model", 
               description = "Predict disease using Machine Learning model (TF-IDF + RandomForest)")
    public ResponseEntity<DiseasePredictionResponse> predictDiseaseML(
            @Valid @RequestBody DiseasePredictionRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        DiseasePredictionResponse response = diseasePredictionService.predictDiseaseML(request, jwtToken);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/predict/dl")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Predict disease using DL model", 
               description = "Predict disease using Deep Learning model (Bidirectional LSTM)")
    public ResponseEntity<DiseasePredictionResponse> predictDiseaseDL(
            @Valid @RequestBody DiseasePredictionRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        DiseasePredictionResponse response = diseasePredictionService.predictDiseaseDL(request, jwtToken);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/compare")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Compare ML and DL predictions", 
               description = "Compare disease predictions from both ML and DL models side by side")
    public ResponseEntity<DiseaseComparisonResponse> compareModels(
            @Valid @RequestBody DiseasePredictionRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        DiseaseComparisonResponse response = diseasePredictionService.compareModels(request, jwtToken);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/analyze")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Analyze symptom prediction", 
               description = "Get detailed analysis of how the model made the prediction (feature/word importance)")
    public ResponseEntity<DiseaseAnalysisResponse> analyzeSymptoms(
            @Valid @RequestBody DiseaseAnalysisRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        DiseaseAnalysisResponse response = diseasePredictionService.analyzeSymptoms(request, jwtToken);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if disease prediction service is available")
    public ResponseEntity<MessageResponse> healthCheck() {
        try {
            // Create a simple test request
            DiseasePredictionRequest testRequest = new DiseasePredictionRequest();
            testRequest.setSymptoms("test symptoms");
            testRequest.setMethod("ensemble");
            
            // Try to make a prediction (this will use fallback if service is down)
            DiseasePredictionResponse response = diseasePredictionService.predictDisease(testRequest, null);
            
            if ("fallback".equals(response.getModelType())) {
                return ResponseEntity.ok(new MessageResponse("Disease prediction service is in fallback mode"));
            } else {
                return ResponseEntity.ok(new MessageResponse("Disease prediction service is healthy"));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(new MessageResponse("Disease prediction service is unavailable: " + e.getMessage()));
        }
    }
}
