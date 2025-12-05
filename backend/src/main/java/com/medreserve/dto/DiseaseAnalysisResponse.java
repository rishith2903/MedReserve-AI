package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class DiseaseAnalysisResponse {
    
    private String predictedDisease;
    private Double confidence;
    private String analysisType;
    private String originalText;
    
    // ML Analysis
    private List<FeatureImportance> featureImportance;
    private List<String> importantWords;
    
    // DL Analysis  
    private List<WordImportance> wordImportance;
    private Map<String, Double> attentionWeights;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    @Data
    public static class FeatureImportance {
        private String feature;
        private Double importance;
        private String description;
    }
    
    @Data
    public static class WordImportance {
        private String word;
        private Double importance;
        private Double confidenceDrop;
    }
}
