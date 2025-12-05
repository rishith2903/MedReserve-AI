package com.medreserve.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SymptomAnalysisRequest {
    
    @NotBlank(message = "Symptoms description is required")
    @Size(min = 5, max = 1000, message = "Symptoms description must be between 5 and 1000 characters")
    private String symptoms;
    
    private Integer age;
    
    private String gender;
}
