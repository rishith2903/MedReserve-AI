package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medreserve.entity.Prescription;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PrescriptionRequest {
    
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;
    
    @Size(max = 2000, message = "Medications cannot exceed 2000 characters")
    private String medications;
    
    @Size(max = 1000, message = "Dosage cannot exceed 1000 characters")
    private String dosage;
    
    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;
    
    @Size(max = 1000, message = "Diagnosis cannot exceed 1000 characters")
    private String diagnosis;
    
    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime prescriptionDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime validUntil;
    
    private Prescription.PrescriptionStatus status = Prescription.PrescriptionStatus.ACTIVE;
    
    private Boolean isDigital = true;
}
