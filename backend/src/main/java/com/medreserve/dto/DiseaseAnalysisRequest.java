package com.medreserve.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DiseaseAnalysisRequest {
    
    @NotBlank(message = "Symptoms description is required")
    @Size(min = 5, max = 2000, message = "Symptoms description must be between 5 and 2000 characters")
    private String symptoms;
    
    private String analysisType = "ml"; // "ml" or "dl"
    
    private Integer topFeatures = 10;
}
