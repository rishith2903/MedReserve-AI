package com.medreserve.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @NotBlank(message = "Medical license number is required")
    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;
    
    @NotBlank(message = "Specialty is required")
    @Column(nullable = false)
    private String specialty;
    
    @Column(name = "sub_specialty")
    private String subSpecialty;
    
    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Years of experience cannot be negative")
    @Column(name = "years_of_experience", nullable = false)
    private Integer yearsOfExperience;
    
    @NotBlank(message = "Qualification is required")
    @Column(nullable = false, length = 1000)
    private String qualification;
    
    @Column(length = 2000)
    private String biography;
    
    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be greater than 0")
    @Column(name = "consultation_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee;
    
    // Working hours - Morning session
    @Column(name = "morning_start_time")
    private LocalTime morningStartTime = LocalTime.of(10, 0); // 10:00 AM
    
    @Column(name = "morning_end_time")
    private LocalTime morningEndTime = LocalTime.of(13, 0); // 1:00 PM
    
    // Working hours - Evening session
    @Column(name = "evening_start_time")
    private LocalTime eveningStartTime = LocalTime.of(15, 0); // 3:00 PM
    
    @Column(name = "evening_end_time")
    private LocalTime eveningEndTime = LocalTime.of(18, 0); // 6:00 PM
    
    @Column(name = "slot_duration_minutes")
    private Integer slotDurationMinutes = 30; // Default 30 minutes
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    @Column(name = "hospital_affiliation")
    private String hospitalAffiliation;
    
    @Column(name = "clinic_address", length = 1000)
    private String clinicAddress;
    
    @Column(name = "consultation_type")
    @Enumerated(EnumType.STRING)
    private ConsultationType consultationType = ConsultationType.BOTH;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;
    
    public enum ConsultationType {
        ONLINE_ONLY("Online consultation only"),
        IN_PERSON_ONLY("In-person consultation only"),
        BOTH("Both online and in-person");
        
        private final String description;
        
        ConsultationType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public String getFullName() {
        return user != null ? user.getFullName() : "";
    }
    
    public String getEmail() {
        return user != null ? user.getEmail() : "";
    }
    
    public String getPhoneNumber() {
        return user != null ? user.getPhoneNumber() : "";
    }
}
