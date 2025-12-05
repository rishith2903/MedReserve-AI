package com.medreserve.dto;

import com.medreserve.entity.Doctor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class DoctorResponse {
    
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String licenseNumber;
    private String specialty;
    private String subSpecialty;
    private Integer yearsOfExperience;
    private String qualification;
    private String biography;
    private BigDecimal consultationFee;
    private LocalTime morningStartTime;
    private LocalTime morningEndTime;
    private LocalTime eveningStartTime;
    private LocalTime eveningEndTime;
    private Integer slotDurationMinutes;
    private Boolean isAvailable;
    private String hospitalAffiliation;
    private String clinicAddress;
    private Doctor.ConsultationType consultationType;
    private BigDecimal averageRating;
    private Integer totalReviews;
}
