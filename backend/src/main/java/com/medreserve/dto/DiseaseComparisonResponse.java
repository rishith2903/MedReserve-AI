package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class DiseaseComparisonResponse {
    
    private String symptomText;
    private Map<String, Object> mlPrediction;
    private Map<String, Object> dlPrediction;
    private Boolean agreement;
    private Double confidenceDifference;
    private ConsensusResult consensus;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    @Data
    public static class ConsensusResult {
        private String disease;
        private Double avgConfidence;
        private String agreementLevel; // "high", "medium", "low"
    }
}
