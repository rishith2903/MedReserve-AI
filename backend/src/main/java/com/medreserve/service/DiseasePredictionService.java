package com.medreserve.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medreserve.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiseasePredictionService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${disease.prediction.service.url:http://localhost:8003}")
    private String diseasePredictionServiceUrl;
    
    @Value("${disease.prediction.fallback.enabled:true}")
    private boolean fallbackEnabled;
    
    public DiseasePredictionResponse predictDisease(DiseasePredictionRequest request, String jwtToken) {
        try {
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("symptoms", request.getSymptoms());
            requestBody.put("method", request.getMethod());
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwtToken != null) {
                headers.setBearerAuth(jwtToken);
            }
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request to disease prediction service
            ResponseEntity<Map> response = restTemplate.exchange(
                    diseasePredictionServiceUrl + "/predict",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return mapToDiseasePredictionResponse(response.getBody(), request.getMethod());
            } else {
                throw new RuntimeException("Disease prediction service returned unexpected response");
            }
            
        } catch (Exception e) {
            log.error("Error calling disease prediction service: {}", e.getMessage());
            
            if (fallbackEnabled) {
                log.info("Using fallback disease prediction for symptoms: {}", request.getSymptoms());
                return createFallbackPrediction(request);
            } else {
                throw new RuntimeException("Disease prediction service unavailable: " + e.getMessage());
            }
        }
    }
    
    public DiseasePredictionResponse predictDiseaseML(DiseasePredictionRequest request, String jwtToken) {
        request.setMethod("ml");
        return predictDisease(request, jwtToken);
    }
    
    public DiseasePredictionResponse predictDiseaseDL(DiseasePredictionRequest request, String jwtToken) {
        request.setMethod("dl");
        return predictDisease(request, jwtToken);
    }
    
    public DiseaseComparisonResponse compareModels(DiseasePredictionRequest request, String jwtToken) {
        try {
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("symptoms", request.getSymptoms());
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwtToken != null) {
                headers.setBearerAuth(jwtToken);
            }
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request to disease prediction service
            ResponseEntity<Map> response = restTemplate.exchange(
                    diseasePredictionServiceUrl + "/compare",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return mapToComparisonResponse(response.getBody());
            } else {
                throw new RuntimeException("Disease comparison service returned unexpected response");
            }
            
        } catch (Exception e) {
            log.error("Error calling disease comparison service: {}", e.getMessage());
            
            if (fallbackEnabled) {
                return createFallbackComparison(request);
            } else {
                throw new RuntimeException("Disease comparison service unavailable: " + e.getMessage());
            }
        }
    }
    
    public DiseaseAnalysisResponse analyzeSymptoms(DiseaseAnalysisRequest request, String jwtToken) {
        try {
            String endpoint = request.getAnalysisType().equals("ml") ? "/analyze/ml" : "/analyze/dl";
            
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("symptoms", request.getSymptoms());
            if (request.getTopFeatures() != null) {
                requestBody.put("top_features", request.getTopFeatures());
            }
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwtToken != null) {
                headers.setBearerAuth(jwtToken);
            }
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request to disease prediction service
            ResponseEntity<Map> response = restTemplate.exchange(
                    diseasePredictionServiceUrl + endpoint,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return mapToAnalysisResponse(response.getBody(), request.getAnalysisType());
            } else {
                throw new RuntimeException("Disease analysis service returned unexpected response");
            }
            
        } catch (Exception e) {
            log.error("Error calling disease analysis service: {}", e.getMessage());
            
            if (fallbackEnabled) {
                return createFallbackAnalysis(request);
            } else {
                throw new RuntimeException("Disease analysis service unavailable: " + e.getMessage());
            }
        }
    }
    
    private DiseasePredictionResponse mapToDiseasePredictionResponse(Map<String, Object> responseBody, String method) {
        DiseasePredictionResponse response = new DiseasePredictionResponse();
        
        response.setPredictedDisease((String) responseBody.get("predicted_disease"));
        response.setConfidence(((Number) responseBody.get("confidence")).doubleValue());
        response.setModelType((String) responseBody.get("model_type"));
        response.setOriginalText((String) responseBody.get("original_text"));
        response.setEnsembleMethod((String) responseBody.get("ensemble_method"));
        response.setTimestamp(LocalDateTime.now());
        
        // Map top predictions
        List<Map<String, Object>> topPreds = (List<Map<String, Object>>) responseBody.get("top_predictions");
        if (topPreds != null) {
            List<DiseasePredictionResponse.DiseasePrediction> predictions = new ArrayList<>();
            for (Map<String, Object> pred : topPreds) {
                DiseasePredictionResponse.DiseasePrediction dp = new DiseasePredictionResponse.DiseasePrediction();
                dp.setDisease((String) pred.get("disease"));
                dp.setConfidence(((Number) pred.get("confidence")).doubleValue());
                
                if (pred.containsKey("ml_confidence")) {
                    dp.setMlConfidence(((Number) pred.get("ml_confidence")).doubleValue());
                }
                if (pred.containsKey("dl_confidence")) {
                    dp.setDlConfidence(((Number) pred.get("dl_confidence")).doubleValue());
                }
                
                predictions.add(dp);
            }
            response.setTopPredictions(predictions);
        }
        
        // Map ensemble-specific fields
        if (responseBody.containsKey("individual_predictions")) {
            response.setIndividualPredictions((Map<String, Object>) responseBody.get("individual_predictions"));
        }
        if (responseBody.containsKey("ml_weight")) {
            response.setMlWeight(((Number) responseBody.get("ml_weight")).doubleValue());
        }
        if (responseBody.containsKey("dl_weight")) {
            response.setDlWeight(((Number) responseBody.get("dl_weight")).doubleValue());
        }
        
        return response;
    }
    
    private DiseaseComparisonResponse mapToComparisonResponse(Map<String, Object> responseBody) {
        DiseaseComparisonResponse response = new DiseaseComparisonResponse();
        
        response.setSymptomText((String) responseBody.get("symptom_text"));
        response.setMlPrediction((Map<String, Object>) responseBody.get("ml_prediction"));
        response.setDlPrediction((Map<String, Object>) responseBody.get("dl_prediction"));
        response.setAgreement((Boolean) responseBody.get("agreement"));
        
        if (responseBody.containsKey("confidence_difference")) {
            response.setConfidenceDifference(((Number) responseBody.get("confidence_difference")).doubleValue());
        }
        
        // Map consensus if available
        if (responseBody.containsKey("consensus")) {
            Map<String, Object> consensus = (Map<String, Object>) responseBody.get("consensus");
            DiseaseComparisonResponse.ConsensusResult consensusResult = new DiseaseComparisonResponse.ConsensusResult();
            consensusResult.setDisease((String) consensus.get("disease"));
            consensusResult.setAvgConfidence(((Number) consensus.get("avg_confidence")).doubleValue());
            
            // Determine agreement level
            if (response.getAgreement() != null && response.getAgreement()) {
                if (response.getConfidenceDifference() != null && response.getConfidenceDifference() < 0.1) {
                    consensusResult.setAgreementLevel("high");
                } else {
                    consensusResult.setAgreementLevel("medium");
                }
            } else {
                consensusResult.setAgreementLevel("low");
            }
            
            response.setConsensus(consensusResult);
        }
        
        response.setTimestamp(LocalDateTime.now());
        return response;
    }
    
    private DiseaseAnalysisResponse mapToAnalysisResponse(Map<String, Object> responseBody, String analysisType) {
        DiseaseAnalysisResponse response = new DiseaseAnalysisResponse();
        
        response.setPredictedDisease((String) responseBody.get("predicted_disease"));
        response.setConfidence(((Number) responseBody.get("confidence")).doubleValue());
        response.setAnalysisType(analysisType);
        response.setOriginalText((String) responseBody.get("original_text"));
        response.setTimestamp(LocalDateTime.now());
        
        if (analysisType.equals("ml")) {
            // Map feature importance
            List<Map<String, Object>> features = (List<Map<String, Object>>) responseBody.get("feature_importance");
            if (features != null) {
                List<DiseaseAnalysisResponse.FeatureImportance> featureImportance = new ArrayList<>();
                for (Map<String, Object> feature : features) {
                    DiseaseAnalysisResponse.FeatureImportance fi = new DiseaseAnalysisResponse.FeatureImportance();
                    fi.setFeature((String) feature.get("feature"));
                    fi.setImportance(((Number) feature.get("importance")).doubleValue());
                    fi.setDescription((String) feature.get("description"));
                    featureImportance.add(fi);
                }
                response.setFeatureImportance(featureImportance);
            }
            
            response.setImportantWords((List<String>) responseBody.get("important_words"));
        } else {
            // Map word importance for DL
            List<Map<String, Object>> words = (List<Map<String, Object>>) responseBody.get("word_importance");
            if (words != null) {
                List<DiseaseAnalysisResponse.WordImportance> wordImportance = new ArrayList<>();
                for (Map<String, Object> word : words) {
                    DiseaseAnalysisResponse.WordImportance wi = new DiseaseAnalysisResponse.WordImportance();
                    wi.setWord((String) word.get("word"));
                    wi.setImportance(((Number) word.get("importance")).doubleValue());
                    wi.setConfidenceDrop(((Number) word.get("confidence_drop")).doubleValue());
                    wordImportance.add(wi);
                }
                response.setWordImportance(wordImportance);
            }
            
            response.setAttentionWeights((Map<String, Double>) responseBody.get("attention_weights"));
        }
        
        return response;
    }

    private DiseasePredictionResponse createFallbackPrediction(DiseasePredictionRequest request) {
        log.info("Creating fallback disease prediction for symptoms: {}", request.getSymptoms());

        DiseasePredictionResponse response = new DiseasePredictionResponse();
        String symptoms = request.getSymptoms().toLowerCase();

        // Simple keyword-based fallback prediction
        String predictedDisease = "Unknown Condition";
        double confidence = 0.5;

        if (symptoms.contains("fever") && symptoms.contains("cough")) {
            predictedDisease = "Respiratory Infection";
            confidence = 0.75;
        } else if (symptoms.contains("headache") && symptoms.contains("nausea")) {
            predictedDisease = "Migraine";
            confidence = 0.70;
        } else if (symptoms.contains("stomach") && symptoms.contains("pain")) {
            predictedDisease = "Gastritis";
            confidence = 0.65;
        } else if (symptoms.contains("chest") && symptoms.contains("pain")) {
            predictedDisease = "Chest Pain Syndrome";
            confidence = 0.60;
        } else if (symptoms.contains("fever")) {
            predictedDisease = "Viral Infection";
            confidence = 0.60;
        } else if (symptoms.contains("cough")) {
            predictedDisease = "Upper Respiratory Infection";
            confidence = 0.55;
        }

        response.setPredictedDisease(predictedDisease);
        response.setConfidence(confidence);
        response.setModelType("fallback");
        response.setOriginalText(request.getSymptoms());
        response.setEnsembleMethod("keyword_matching");
        response.setTimestamp(LocalDateTime.now());

        // Create top predictions
        List<DiseasePredictionResponse.DiseasePrediction> topPredictions = new ArrayList<>();
        DiseasePredictionResponse.DiseasePrediction primary = new DiseasePredictionResponse.DiseasePrediction();
        primary.setDisease(predictedDisease);
        primary.setConfidence(confidence);
        primary.setDescription("Fallback prediction based on keyword matching");
        topPredictions.add(primary);

        response.setTopPredictions(topPredictions);

        return response;
    }

    private DiseaseComparisonResponse createFallbackComparison(DiseasePredictionRequest request) {
        DiseaseComparisonResponse response = new DiseaseComparisonResponse();

        response.setSymptomText(request.getSymptoms());
        response.setAgreement(null);
        response.setConfidenceDifference(null);
        response.setTimestamp(LocalDateTime.now());

        // Create fallback predictions
        Map<String, Object> fallbackPrediction = new HashMap<>();
        fallbackPrediction.put("predicted_disease", "Service Unavailable");
        fallbackPrediction.put("confidence", 0.0);
        fallbackPrediction.put("error", "Disease prediction service is currently unavailable");

        response.setMlPrediction(fallbackPrediction);
        response.setDlPrediction(fallbackPrediction);

        return response;
    }

    private DiseaseAnalysisResponse createFallbackAnalysis(DiseaseAnalysisRequest request) {
        DiseaseAnalysisResponse response = new DiseaseAnalysisResponse();

        response.setPredictedDisease("Service Unavailable");
        response.setConfidence(0.0);
        response.setAnalysisType(request.getAnalysisType());
        response.setOriginalText(request.getSymptoms());
        response.setTimestamp(LocalDateTime.now());

        // Create basic fallback analysis
        if (request.getAnalysisType().equals("ml")) {
            List<DiseaseAnalysisResponse.FeatureImportance> features = new ArrayList<>();
            DiseaseAnalysisResponse.FeatureImportance feature = new DiseaseAnalysisResponse.FeatureImportance();
            feature.setFeature("service_unavailable");
            feature.setImportance(0.0);
            feature.setDescription("Disease analysis service is currently unavailable");
            features.add(feature);
            response.setFeatureImportance(features);
        } else {
            List<DiseaseAnalysisResponse.WordImportance> words = new ArrayList<>();
            DiseaseAnalysisResponse.WordImportance word = new DiseaseAnalysisResponse.WordImportance();
            word.setWord("unavailable");
            word.setImportance(0.0);
            word.setConfidenceDrop(0.0);
            words.add(word);
            response.setWordImportance(words);
        }

        return response;
    }
}
