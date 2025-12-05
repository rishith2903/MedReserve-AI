package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class DiseasePredictionResponse {
    
    private String predictedDisease;
    private Double confidence;
    private List<DiseasePrediction> topPredictions;
    private String modelType;
    private String originalText;
    private String ensembleMethod;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    // For ensemble predictions
    private Map<String, Object> individualPredictions;
    private Double mlWeight;
    private Double dlWeight;
    
    @Data
    public static class DiseasePrediction {
        private String disease;
        private Double confidence;
        private Double mlConfidence;
        private Double dlConfidence;
        private String description;
    }
}
