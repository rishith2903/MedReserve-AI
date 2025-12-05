package com.medreserve.dto;

import com.medreserve.entity.Doctor;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class DoctorRegistrationRequest {
    
    // User information
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    private String lastName;
    
    @Email(message = "Please provide a valid email address")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Please provide a valid phone number")
    private String phoneNumber;
    
    @Size(max = 1000)
    private String address;
    
    // Doctor-specific information
    @NotBlank(message = "Medical license number is required")
    private String licenseNumber;
    
    @NotBlank(message = "Specialty is required")
    private String specialty;
    
    private String subSpecialty;
    
    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Years of experience cannot be negative")
    private Integer yearsOfExperience;
    
    @NotBlank(message = "Qualification is required")
    @Size(max = 1000)
    private String qualification;
    
    @Size(max = 2000)
    private String biography;
    
    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be greater than 0")
    private BigDecimal consultationFee;
    
    // Working hours
    private LocalTime morningStartTime;
    private LocalTime morningEndTime;
    private LocalTime eveningStartTime;
    private LocalTime eveningEndTime;
    
    @Min(value = 15, message = "Slot duration must be at least 15 minutes")
    @Max(value = 120, message = "Slot duration cannot exceed 120 minutes")
    private Integer slotDurationMinutes = 30;
    
    private String hospitalAffiliation;
    
    @Size(max = 1000)
    private String clinicAddress;
    
    private Doctor.ConsultationType consultationType = Doctor.ConsultationType.BOTH;
}
