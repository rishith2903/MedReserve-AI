package com.medreserve.service;

import com.medreserve.dto.AppointmentRequest;
import com.medreserve.dto.AppointmentResponse;
import com.medreserve.dto.TimeSlotResponse;
import com.medreserve.entity.Appointment;
import com.medreserve.entity.Doctor;
import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.repository.AppointmentRepository;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {
    
    @Mock
    private AppointmentRepository appointmentRepository;
    
    @Mock
    private DoctorRepository doctorRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private AppointmentService appointmentService;
    
    private User patient;
    private Doctor doctor;
    private User doctorUser;
    private AppointmentRequest appointmentRequest;
    
    @BeforeEach
    void setUp() {
        // Create patient
        Role patientRole = new Role();
        patientRole.setName(Role.RoleName.PATIENT);
        
        patient = new User();
        patient.setId(1L);
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setEmail("john.doe@example.com");
        patient.setRole(patientRole);
        patient.setIsActive(true);
        patient.setEmailVerified(true);
        
        // Create doctor user
        Role doctorRole = new Role();
        doctorRole.setName(Role.RoleName.DOCTOR);
        
        doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setFirstName("Dr. Jane");
        doctorUser.setLastName("Smith");
        doctorUser.setEmail("dr.jane@example.com");
        doctorUser.setRole(doctorRole);
        doctorUser.setIsActive(true);
        doctorUser.setEmailVerified(true);
        
        // Create doctor
        doctor = new Doctor();
        doctor.setId(1L);
        doctor.setUser(doctorUser);
        doctor.setLicenseNumber("MD12345");
        doctor.setSpecialty("Cardiology");
        doctor.setYearsOfExperience(10);
        doctor.setQualification("MBBS, MD");
        doctor.setConsultationFee(new BigDecimal("500.00"));
        doctor.setMorningStartTime(LocalTime.of(10, 0));
        doctor.setMorningEndTime(LocalTime.of(13, 0));
        doctor.setEveningStartTime(LocalTime.of(15, 0));
        doctor.setEveningEndTime(LocalTime.of(18, 0));
        doctor.setSlotDurationMinutes(30);
        doctor.setIsAvailable(true);
        
        // Create appointment request
        appointmentRequest = new AppointmentRequest();
        appointmentRequest.setDoctorId(1L);
        appointmentRequest.setAppointmentDateTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));
        appointmentRequest.setAppointmentType(Appointment.AppointmentType.ONLINE);
        appointmentRequest.setChiefComplaint("Chest pain");
        appointmentRequest.setSymptoms("Experiencing chest pain for 2 days");
        appointmentRequest.setDurationMinutes(30);
    }
    
    @Test
    void testBookAppointmentSuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findConflictingAppointments(anyLong(), any(), any()))
                .thenReturn(new ArrayList<>());
        
        Appointment savedAppointment = new Appointment();
        savedAppointment.setId(1L);
        savedAppointment.setPatient(patient);
        savedAppointment.setDoctor(doctor);
        savedAppointment.setAppointmentDateTime(appointmentRequest.getAppointmentDateTime());
        savedAppointment.setDurationMinutes(30);
        savedAppointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        savedAppointment.setAppointmentType(appointmentRequest.getAppointmentType());
        savedAppointment.setConsultationFee(doctor.getConsultationFee());
        savedAppointment.setCreatedAt(LocalDateTime.now());
        savedAppointment.setUpdatedAt(LocalDateTime.now());
        
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);
        
        // Act
        AppointmentResponse response = appointmentService.bookAppointment(appointmentRequest, 1L);
        
        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John Doe", response.getPatientName());
        assertEquals("Dr. Jane Smith", response.getDoctorName());
        assertEquals(Appointment.AppointmentStatus.SCHEDULED, response.getStatus());
        assertEquals(doctor.getConsultationFee(), response.getConsultationFee());
        
        verify(appointmentRepository).save(any(Appointment.class));
    }
    
    @Test
    void testBookAppointmentPatientNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest, 1L));
        
        assertEquals("Patient not found", exception.getReason());
        verify(appointmentRepository, never()).save(any());
    }
    
    @Test
    void testBookAppointmentDoctorNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());
        
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest, 1L));
        
        assertEquals("Doctor not found", exception.getReason());
        verify(appointmentRepository, never()).save(any());
    }
    
    @Test
    void testBookAppointmentDoctorNotAvailable() {
        // Arrange
        doctor.setIsAvailable(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest, 1L));
        
        assertEquals("Doctor is not available", exception.getReason());
        verify(appointmentRepository, never()).save(any());
    }
    
    @Test
    void testBookAppointmentTimeConflict() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        
        // Create conflicting appointment
        Appointment conflictingAppointment = new Appointment();
        conflictingAppointment.setAppointmentDateTime(appointmentRequest.getAppointmentDateTime());
        conflictingAppointment.setEndDateTime(appointmentRequest.getAppointmentDateTime().plusMinutes(30));
        
        when(appointmentRepository.findConflictingAppointments(anyLong(), any(), any()))
                .thenReturn(List.of(conflictingAppointment));
        
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest, 1L));
        
        assertEquals("Doctor already has an appointment during this time slot", exception.getReason());
        verify(appointmentRepository, never()).save(any());
    }
    
    @Test
    void testGetAvailableSlotsSuccess() {
        // Arrange
        LocalDate testDate = LocalDate.now().plusDays(1);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findDoctorAppointmentsByDate(anyLong(), any()))
                .thenReturn(new ArrayList<>());
        
        // Act
        List<TimeSlotResponse> slots = appointmentService.getAvailableSlots(1L, testDate);
        
        // Assert
        assertNotNull(slots);
        assertFalse(slots.isEmpty());
        
        // Should have morning and evening slots
        long morningSlots = slots.stream().filter(slot -> "MORNING".equals(slot.getSession())).count();
        long eveningSlots = slots.stream().filter(slot -> "EVENING".equals(slot.getSession())).count();
        
        assertTrue(morningSlots > 0);
        assertTrue(eveningSlots > 0);
        
        // All slots should be available since no existing appointments
        assertTrue(slots.stream().allMatch(TimeSlotResponse::isAvailable));
    }
    
    @Test
    void testGetAvailableSlotsDoctorNotFound() {
        // Arrange
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());
        
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
                () -> appointmentService.getAvailableSlots(1L, LocalDate.now()));
        
        assertEquals("Doctor not found", exception.getReason());
    }
    
    @Test
    void testGetAvailableSlotsDoctorNotAvailable() {
        // Arrange
        doctor.setIsAvailable(false);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        
        // Act
        List<TimeSlotResponse> slots = appointmentService.getAvailableSlots(1L, LocalDate.now());
        
        // Assert
        assertNotNull(slots);
        assertTrue(slots.isEmpty());
    }
    
    @Test
    void testValidateAppointmentTimeInPast() {
        // Arrange
        appointmentRequest.setAppointmentDateTime(LocalDateTime.now().minusHours(1));
        when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest, 1L));
        
        assertEquals("Cannot book appointment in the past", exception.getReason());
    }
    
    @Test
    void testValidateAppointmentTimeOutsideWorkingHours() {
        // Arrange - Set appointment time outside working hours
        appointmentRequest.setAppointmentDateTime(LocalDateTime.now().plusDays(1).withHour(8).withMinute(0));
        when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest, 1L));
        
        assertEquals("Appointment time is outside doctor's working hours", exception.getReason());
    }
}
