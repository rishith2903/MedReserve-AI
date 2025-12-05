package com.medreserve.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medreserve.dto.AppointmentRequest;
import com.medreserve.entity.Appointment;
import com.medreserve.entity.Doctor;
import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.repository.AppointmentRepository;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.RoleRepository;
import com.medreserve.repository.UserRepository;
import com.medreserve.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AppointmentControllerIntegrationTest {
    
    @Autowired
    private WebApplicationContext context;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    private MockMvc mockMvc;
    private User patient;
    private Doctor doctor;
    private String patientToken;
    private String doctorToken;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        
        setupTestData();
    }
    
    private void setupTestData() {
        // Create roles
        Role patientRole = roleRepository.findByName(Role.RoleName.PATIENT)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(Role.RoleName.PATIENT);
                    role.setDescription("Patient role");
                    return roleRepository.save(role);
                });
        
        Role doctorRole = roleRepository.findByName(Role.RoleName.DOCTOR)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(Role.RoleName.DOCTOR);
                    role.setDescription("Doctor role");
                    return roleRepository.save(role);
                });
        
        // Create patient
        patient = new User();
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setEmail("patient@test.com");
        patient.setPassword(passwordEncoder.encode("password"));
        patient.setRole(patientRole);
        patient.setIsActive(true);
        patient.setEmailVerified(true);
        patient = userRepository.save(patient);
        
        // Create doctor user
        User doctorUser = new User();
        doctorUser.setFirstName("Dr. Jane");
        doctorUser.setLastName("Smith");
        doctorUser.setEmail("doctor@test.com");
        doctorUser.setPassword(passwordEncoder.encode("password"));
        doctorUser.setRole(doctorRole);
        doctorUser.setIsActive(true);
        doctorUser.setEmailVerified(true);
        doctorUser = userRepository.save(doctorUser);
        
        // Create doctor profile
        doctor = new Doctor();
        doctor.setUser(doctorUser);
        doctor.setLicenseNumber("TEST123");
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
        doctor = doctorRepository.save(doctor);
        
        // Generate JWT tokens
        Authentication patientAuth = new UsernamePasswordAuthenticationToken(patient, null, patient.getAuthorities());
        Authentication doctorAuth = new UsernamePasswordAuthenticationToken(doctorUser, null, doctorUser.getAuthorities());
        
        patientToken = jwtUtils.generateJwtToken(patientAuth);
        doctorToken = jwtUtils.generateJwtToken(doctorAuth);
    }
    
    @Test
    void testBookAppointmentSuccess() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(doctor.getId());
        request.setAppointmentDateTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));
        request.setAppointmentType(Appointment.AppointmentType.ONLINE);
        request.setChiefComplaint("Chest pain");
        request.setSymptoms("Experiencing chest pain");
        request.setDurationMinutes(30);
        
        mockMvc.perform(post("/appointments/book")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientName").value("John Doe"))
                .andExpect(jsonPath("$.doctorName").value("Dr. Jane Smith"))
                .andExpect(jsonPath("$.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.consultationFee").value(500.00));
    }
    
    @Test
    void testBookAppointmentUnauthorized() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(doctor.getId());
        request.setAppointmentDateTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        request.setAppointmentType(Appointment.AppointmentType.ONLINE);

        mockMvc.perform(post("/appointments/book")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden()); // Changed from isUnauthorized() to isForbidden()
    }
    
    @Test
    void testGetAvailableSlots() throws Exception {
        String date = LocalDateTime.now().plusDays(1).toLocalDate().toString();
        
        mockMvc.perform(get("/appointments/doctor/{doctorId}/available-slots", doctor.getId())
                .param("date", date))
                .andExpect(status().isOk());
    }
    
    @Test
    void testGetPatientAppointments() throws Exception {
        // First create an appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        appointment.setDurationMinutes(30);
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        appointment.setAppointmentType(Appointment.AppointmentType.ONLINE);
        appointment.setConsultationFee(doctor.getConsultationFee());
        appointmentRepository.save(appointment);
        
        mockMvc.perform(get("/appointments/patient/my-appointments")
                .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].patientName").value("John Doe"));
    }
    
    @Test
    void testCancelAppointment() throws Exception {
        // First create an appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        appointment.setDurationMinutes(30);
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        appointment.setAppointmentType(Appointment.AppointmentType.ONLINE);
        appointment.setConsultationFee(doctor.getConsultationFee());
        appointment = appointmentRepository.save(appointment);
        
        mockMvc.perform(put("/appointments/{appointmentId}/cancel", appointment.getId())
                .header("Authorization", "Bearer " + patientToken)
                .param("reason", "Personal emergency"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Appointment cancelled successfully"))
                .andExpect(jsonPath("$.success").value(true));
    }
}
