package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medreserve.entity.Appointment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AppointmentResponse {
    
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorEmail;
    private String doctorPhone;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime appointmentDateTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endDateTime;
    
    private Integer durationMinutes;
    private Appointment.AppointmentStatus status;
    private Appointment.AppointmentType appointmentType;
    private BigDecimal consultationFee;
    private String chiefComplaint;
    private String symptoms;
    private String doctorNotes;
    private String prescriptionNotes;
    private Boolean followUpRequired;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime followUpDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
    
    private String cancellationReason;
    private String cancelledBy;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime cancelledAt;
    
    // Helper methods
    public boolean isActive() {
        return status == Appointment.AppointmentStatus.SCHEDULED || 
               status == Appointment.AppointmentStatus.CONFIRMED || 
               status == Appointment.AppointmentStatus.IN_PROGRESS;
    }
    
    public boolean canBeCancelled() {
        return status == Appointment.AppointmentStatus.SCHEDULED || 
               status == Appointment.AppointmentStatus.CONFIRMED;
    }
    
    public boolean canBeRescheduled() {
        return status == Appointment.AppointmentStatus.SCHEDULED || 
               status == Appointment.AppointmentStatus.CONFIRMED;
    }
}
