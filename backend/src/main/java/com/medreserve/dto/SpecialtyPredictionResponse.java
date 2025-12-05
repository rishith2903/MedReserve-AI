package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SpecialtyPredictionResponse {
    
    private List<SpecialtyPrediction> predictions;
    private String recommendedSpecialty;
    private Double confidenceScore;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    @Data
    public static class SpecialtyPrediction {
        private String specialty;
        private Double confidence;
        private String description;
    }
}
