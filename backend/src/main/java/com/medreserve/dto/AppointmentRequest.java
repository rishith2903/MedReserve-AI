package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medreserve.entity.Appointment;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    @NotNull(message = "Appointment date and time is required")
    @Future(message = "Appointment must be scheduled for a future date and time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime appointmentDateTime;
    
    @NotNull(message = "Appointment type is required")
    private Appointment.AppointmentType appointmentType;
    
    @Size(max = 1000, message = "Chief complaint cannot exceed 1000 characters")
    private String chiefComplaint;
    
    @Size(max = 2000, message = "Symptoms description cannot exceed 2000 characters")
    private String symptoms;
    
    private Integer durationMinutes = 30;
}
