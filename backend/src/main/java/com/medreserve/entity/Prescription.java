package com.medreserve.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;
    
    @Column(length = 2000)
    private String medications;
    
    @Column(length = 1000)
    private String dosage;
    
    @Column(length = 1000)
    private String instructions;
    
    @Column(length = 1000)
    private String diagnosis;
    
    @Column(length = 2000)
    private String notes;
    
    // File attachment (optional PDF prescription)
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "original_file_name")
    private String originalFileName;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "content_type")
    private String contentType;
    
    @Column(name = "sha256_checksum", length = 64)
    private String sha256Checksum;
    
    @Column(name = "prescription_date", nullable = false)
    private LocalDateTime prescriptionDate;
    
    @Column(name = "valid_until")
    private LocalDateTime validUntil;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrescriptionStatus status = PrescriptionStatus.ACTIVE;
    
    @Column(name = "is_digital", nullable = false)
    private Boolean isDigital = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (prescriptionDate == null) {
            prescriptionDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PrescriptionStatus {
        ACTIVE("Active"),
        EXPIRED("Expired"),
        CANCELLED("Cancelled"),
        COMPLETED("Completed");
        
        private final String description;
        
        PrescriptionStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public boolean hasAttachment() {
        return fileName != null && !fileName.isEmpty();
    }
    
    public boolean isExpired() {
        return validUntil != null && validUntil.isBefore(LocalDateTime.now());
    }
    
    public String getDoctorName() {
        return doctor != null ? doctor.getFullName() : "";
    }
    
    public String getPatientName() {
        return patient != null ? patient.getFullName() : "";
    }
}
