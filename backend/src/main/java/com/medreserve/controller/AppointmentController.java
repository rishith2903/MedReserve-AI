package com.medreserve.controller;

import com.medreserve.dto.*;
import com.medreserve.entity.User;
import com.medreserve.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment management APIs")
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    
    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book appointment", description = "Book a new appointment with a doctor")
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        AppointmentResponse response = appointmentService.bookAppointment(request, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{appointmentId}/reschedule")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Reschedule appointment", description = "Reschedule an existing appointment")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime newDateTime,
            @AuthenticationPrincipal User currentUser) {
        AppointmentResponse response = appointmentService.rescheduleAppointment(
                appointmentId, newDateTime, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{appointmentId}/cancel")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Cancel appointment", description = "Cancel an existing appointment")
    public ResponseEntity<MessageResponse> cancelAppointment(
            @PathVariable Long appointmentId,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal User currentUser) {
        MessageResponse response = appointmentService.cancelAppointment(
                appointmentId, reason, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get appointment details", description = "Get details of a specific appointment")
    public ResponseEntity<AppointmentResponse> getAppointment(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal User currentUser) {
        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/patient/my-appointments")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient appointments", description = "Get all appointments for the current patient")
    public ResponseEntity<Page<AppointmentResponse>> getPatientAppointments(
            @AuthenticationPrincipal User currentUser,
            Pageable pageable) {
        Page<AppointmentResponse> appointments = appointmentService.getPatientAppointments(
                currentUser.getId(), pageable);
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/doctor/my-appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor appointments", description = "Get all appointments for the current doctor")
    public ResponseEntity<Page<AppointmentResponse>> getDoctorAppointments(
            @AuthenticationPrincipal User currentUser,
            Pageable pageable) {
        // Note: This assumes the doctor ID can be derived from user ID
        // In a real implementation, you'd need to get the doctor entity first
        Page<AppointmentResponse> appointments = appointmentService.getDoctorAppointments(
                currentUser.getId(), pageable);
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/doctor/{doctorId}/available-slots")
    @Operation(summary = "Get available time slots", description = "Get available appointment slots for a doctor on a specific date")
    public ResponseEntity<List<TimeSlotResponse>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TimeSlotResponse> slots = appointmentService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(slots);
    }
}
