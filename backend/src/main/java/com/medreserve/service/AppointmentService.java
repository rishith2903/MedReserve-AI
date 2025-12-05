package com.medreserve.service;

import com.medreserve.dto.*;
import com.medreserve.entity.Appointment;
import com.medreserve.entity.Doctor;
import com.medreserve.entity.User;
import com.medreserve.repository.AppointmentRepository;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.cache.annotation.Cacheable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request, Long patientId) {
        // Validate patient
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        
        // Validate doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        
        if (!doctor.getIsAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor is not available");
        }
        
        // Validate appointment time
        validateAppointmentTime(request.getAppointmentDateTime(), doctor, request.getDurationMinutes());
        
        // Check for conflicts
        checkForConflicts(doctor.getId(), request.getAppointmentDateTime(), 
                         request.getAppointmentDateTime().plusMinutes(request.getDurationMinutes()), null);
        
        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setChiefComplaint(request.getChiefComplaint());
        appointment.setSymptoms(request.getSymptoms());
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        
        appointment = appointmentRepository.save(appointment);
        
        log.info("Appointment booked successfully: ID={}, Patient={}, Doctor={}", 
                appointment.getId(), patient.getEmail(), doctor.getUser().getEmail());
        
        return convertToResponse(appointment);
    }
    
    @Transactional
    public AppointmentResponse rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        // Check if user has permission to reschedule
        if (!appointment.getPatient().getId().equals(userId) && 
            !appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to reschedule this appointment");
        }
        
        if (!appointment.canBeRescheduled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Appointment cannot be rescheduled in current status: " + appointment.getStatus());
        }
        
        // Validate new time
        validateAppointmentTime(newDateTime, appointment.getDoctor(), appointment.getDurationMinutes());
        
        // Check for conflicts (excluding current appointment)
        checkForConflicts(appointment.getDoctor().getId(), newDateTime, 
                         newDateTime.plusMinutes(appointment.getDurationMinutes()), appointmentId);
        
        // Update appointment
        appointment.setAppointmentDateTime(newDateTime);
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        
        appointment = appointmentRepository.save(appointment);
        
        log.info("Appointment rescheduled: ID={}, New time={}", appointmentId, newDateTime);
        
        return convertToResponse(appointment);
    }
    
    @Transactional
    public MessageResponse cancelAppointment(Long appointmentId, String reason, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        // Check if user has permission to cancel
        if (!appointment.getPatient().getId().equals(userId) && 
            !appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to cancel this appointment");
        }
        
        if (!appointment.canBeCancelled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Appointment cannot be cancelled in current status: " + appointment.getStatus());
        }
        
        // Update appointment
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setCancelledAt(LocalDateTime.now());
        
        // Determine who cancelled
        if (appointment.getPatient().getId().equals(userId)) {
            appointment.setCancelledBy("PATIENT");
        } else if (appointment.getDoctor().getUser().getId().equals(userId)) {
            appointment.setCancelledBy("DOCTOR");
        }
        
        appointmentRepository.save(appointment);
        
        log.info("Appointment cancelled: ID={}, Reason={}, Cancelled by={}", 
                appointmentId, reason, appointment.getCancelledBy());
        
        return MessageResponse.success("Appointment cancelled successfully");
    }
    
    @Cacheable(cacheNames = "availableSlots", key = "'d:' + #doctorId + ':dt:' + #date")
    public List<TimeSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        
        if (!doctor.getIsAvailable()) {
            return new ArrayList<>();
        }
        
        List<TimeSlotResponse> availableSlots = new ArrayList<>();
        LocalDateTime dateTime = date.atStartOfDay();
        
        // Get existing appointments for the day
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);
        List<Appointment> existingAppointments = appointmentRepository
                .findDoctorAppointmentsByDateRange(doctorId, dayStart, dayEnd);
        
        // Generate slots within fixed window 09:00–21:00
        LocalTime allowedStartTime = LocalTime.of(9, 0);
        LocalTime allowedEndTime = LocalTime.of(21, 0);
        generateSlotsForSession(doctor, date, allowedStartTime, allowedEndTime, "DAY", existingAppointments, availableSlots);
        
        return availableSlots;
    }
    
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPatientAppointments(Long patientId, Pageable pageable) {
        Page<Appointment> appointments = appointmentRepository.findByPatientId(patientId, pageable);
        return appointments.map(this::convertToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getDoctorAppointments(Long doctorId, Pageable pageable) {
        Page<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId, pageable);
        return appointments.map(this::convertToResponse);
    }
    
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        // Check if user has permission to view
        if (!appointment.getPatient().getId().equals(userId) && 
            !appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view this appointment");
        }
        
        return convertToResponse(appointment);
    }
    
    private void validateAppointmentTime(LocalDateTime appointmentDateTime, Doctor doctor, Integer durationMinutes) {
        // Check if appointment is in the past
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book appointment in the past");
        }
        
        // Check if appointment is within fixed working window 09:00–21:00
        LocalTime appointmentTime = appointmentDateTime.toLocalTime();
        LocalTime allowedStart = LocalTime.of(9, 0);
        LocalTime allowedEnd = LocalTime.of(21, 0);
        boolean inAllowedWindow = !appointmentTime.isBefore(allowedStart) &&
                !appointmentTime.isAfter(allowedEnd.minusMinutes(durationMinutes));
        if (!inAllowedWindow) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Appointment time is outside allowed hours (09:00–21:00)");
        }
        
        // Check if appointment time is aligned with slot duration
        int slotDuration = doctor.getSlotDurationMinutes();
        int minutesSinceStartOfDay = appointmentTime.getHour() * 60 + appointmentTime.getMinute();
        
        if (minutesSinceStartOfDay % slotDuration != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Appointment time must be aligned with " + slotDuration + "-minute slots");
        }
    }
    
    private void checkForConflicts(Long doctorId, LocalDateTime startTime, LocalDateTime endTime, Long excludeAppointmentId) {
        List<Appointment> conflicts;
        
        if (excludeAppointmentId != null) {
            conflicts = appointmentRepository.findConflictingAppointmentsExcluding(
                    doctorId, startTime, endTime, excludeAppointmentId);
        } else {
            conflicts = appointmentRepository.findConflictingAppointments(doctorId, startTime, endTime);
        }
        
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                    "Doctor already has an appointment during this time slot");
        }
    }
    
    private void generateSlotsForSession(Doctor doctor, LocalDate date, LocalTime startTime, LocalTime endTime,
                                       String session, List<Appointment> existingAppointments,
                                       List<TimeSlotResponse> availableSlots) {
        LocalDateTime sessionStart = date.atTime(startTime);
        LocalDateTime sessionEnd = date.atTime(endTime);
        int slotDuration = doctor.getSlotDurationMinutes();
        
        LocalDateTime currentSlot = sessionStart;
        
        while (currentSlot.plusMinutes(slotDuration).isBefore(sessionEnd) || 
               currentSlot.plusMinutes(slotDuration).equals(sessionEnd)) {
            
            LocalDateTime slotEnd = currentSlot.plusMinutes(slotDuration);

            // Check if slot is available
            final LocalDateTime finalCurrentSlot = currentSlot;
            final LocalDateTime finalSlotEnd = slotEnd;
            boolean isAvailable = currentSlot.isAfter(LocalDateTime.now()) &&
                    existingAppointments.stream().noneMatch(appointment ->
                            appointment.getAppointmentDateTime().isBefore(finalSlotEnd) &&
                            appointment.getEndDateTime().isAfter(finalCurrentSlot));

            availableSlots.add(new TimeSlotResponse(currentSlot, slotEnd, isAvailable, session));
            
            currentSlot = currentSlot.plusMinutes(slotDuration);
        }
    }
    
    private AppointmentResponse convertToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setPatientId(appointment.getPatient().getId());
        response.setPatientName(appointment.getPatient().getFullName());
        response.setPatientEmail(appointment.getPatient().getEmail());
        response.setPatientPhone(appointment.getPatient().getPhoneNumber());
        response.setDoctorId(appointment.getDoctor().getId());
        response.setDoctorName(appointment.getDoctor().getFullName());
        response.setDoctorSpecialty(appointment.getDoctor().getSpecialty());
        response.setDoctorEmail(appointment.getDoctor().getEmail());
        response.setDoctorPhone(appointment.getDoctor().getPhoneNumber());
        response.setAppointmentDateTime(appointment.getAppointmentDateTime());
        response.setEndDateTime(appointment.getEndDateTime());
        response.setDurationMinutes(appointment.getDurationMinutes());
        response.setStatus(appointment.getStatus());
        response.setAppointmentType(appointment.getAppointmentType());
        response.setConsultationFee(appointment.getConsultationFee());
        response.setChiefComplaint(appointment.getChiefComplaint());
        response.setSymptoms(appointment.getSymptoms());
        response.setDoctorNotes(appointment.getDoctorNotes());
        response.setPrescriptionNotes(appointment.getPrescriptionNotes());
        response.setFollowUpRequired(appointment.getFollowUpRequired());
        response.setFollowUpDate(appointment.getFollowUpDate());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());
        response.setCancellationReason(appointment.getCancellationReason());
        response.setCancelledBy(appointment.getCancelledBy());
        response.setCancelledAt(appointment.getCancelledAt());
        
        return response;
    }
}
