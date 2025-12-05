package com.medreserve.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DiseasePredictionRequest {
    
    @NotBlank(message = "Symptoms description is required")
    @Size(min = 5, max = 2000, message = "Symptoms description must be between 5 and 2000 characters")
    private String symptoms;
    
    private String method = "ensemble"; // "ml", "dl", or "ensemble"
    
    private Integer age;
    
    private String gender;
    
    private String medicalHistory;
}
