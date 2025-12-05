package com.medreserve.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    
    @NotNull(message = "Appointment date and time is required")
    @Column(name = "appointment_datetime", nullable = false)
    private LocalDateTime appointmentDateTime;
    
    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDateTime;
    
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 30;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_type", nullable = false)
    private AppointmentType appointmentType;
    
    @Column(name = "consultation_fee", precision = 10, scale = 2)
    private BigDecimal consultationFee;
    
    @Column(name = "chief_complaint", length = 1000)
    private String chiefComplaint;
    
    @Column(length = 2000)
    private String symptoms;
    
    @Column(name = "doctor_notes", length = 2000)
    private String doctorNotes;
    
    @Column(name = "prescription_notes", length = 2000)
    private String prescriptionNotes;
    
    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;
    
    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;
    
    @Column(name = "cancelled_by")
    private String cancelledBy; // PATIENT, DOCTOR, ADMIN
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Calculate end time based on duration
        if (appointmentDateTime != null && durationMinutes != null) {
            endDateTime = appointmentDateTime.plusMinutes(durationMinutes);
        }
        
        // Set consultation fee from doctor
        if (doctor != null && consultationFee == null) {
            consultationFee = doctor.getConsultationFee();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        // Update end time if appointment time or duration changed
        if (appointmentDateTime != null && durationMinutes != null) {
            endDateTime = appointmentDateTime.plusMinutes(durationMinutes);
        }
    }
    
    public enum AppointmentStatus {
        SCHEDULED("Scheduled"),
        CONFIRMED("Confirmed"),
        IN_PROGRESS("In Progress"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        NO_SHOW("No Show"),
        RESCHEDULED("Rescheduled");
        
        private final String description;
        
        AppointmentStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public enum AppointmentType {
        ONLINE("Online Consultation"),
        IN_PERSON("In-Person Consultation"),
        FOLLOW_UP("Follow-up Consultation"),
        EMERGENCY("Emergency Consultation");
        
        private final String description;
        
        AppointmentType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public boolean isActive() {
        return status == AppointmentStatus.SCHEDULED || 
               status == AppointmentStatus.CONFIRMED || 
               status == AppointmentStatus.IN_PROGRESS;
    }
    
    public boolean canBeCancelled() {
        return status == AppointmentStatus.SCHEDULED || 
               status == AppointmentStatus.CONFIRMED;
    }
    
    public boolean canBeRescheduled() {
        return status == AppointmentStatus.SCHEDULED || 
               status == AppointmentStatus.CONFIRMED;
    }
}
