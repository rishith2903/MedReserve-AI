package com.medreserve.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    @NotBlank(message = "Report title is required")
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @NotBlank(message = "File name is required")
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @NotBlank(message = "Original file name is required")
    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;
    
    @NotBlank(message = "File path is required")
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @NotNull(message = "File size is required")
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @NotBlank(message = "Content type is required")
    @Column(name = "content_type", nullable = false)
    private String contentType;
    
    @Column(name = "sha256_checksum", length = 64)
    private String sha256Checksum;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;
    
    @Column(name = "report_date")
    private LocalDateTime reportDate;
    
    @Column(name = "lab_name")
    private String labName;
    
    @Column(name = "doctor_name")
    private String doctorName;
    
    @Column(name = "is_shared_with_doctor", nullable = false)
    private Boolean isSharedWithDoctor = false;
    
    @Column(name = "shared_at")
    private LocalDateTime sharedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ReportType {
        BLOOD_TEST("Blood Test"),
        URINE_TEST("Urine Test"),
        X_RAY("X-Ray"),
        CT_SCAN("CT Scan"),
        MRI("MRI"),
        ULTRASOUND("Ultrasound"),
        ECG("ECG"),
        ECHO("Echocardiogram"),
        PATHOLOGY("Pathology Report"),
        RADIOLOGY("Radiology Report"),
        PRESCRIPTION("Prescription"),
        DISCHARGE_SUMMARY("Discharge Summary"),
        OTHER("Other");
        
        private final String description;
        
        ReportType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public String getFileExtension() {
        if (originalFileName != null && originalFileName.contains(".")) {
            return originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return "";
    }
    
    public boolean isPdf() {
        return "application/pdf".equals(contentType);
    }
    
    public boolean isImage() {
        return contentType != null && contentType.startsWith("image/");
    }
}
