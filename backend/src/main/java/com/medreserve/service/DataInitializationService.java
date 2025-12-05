package com.medreserve.service;

import com.medreserve.entity.Doctor;
import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.RoleRepository;
import com.medreserve.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

// @Service - Disabled to use DataInitializer instead
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {
    
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");
        initializeRoles();
        initializeMasterAdmin();
        initializeDefaultUsers();
        log.info("Data initialization completed.");
    }
    
    private void initializeRoles() {
        for (Role.RoleName roleName : Role.RoleName.values()) {
            if (!roleRepository.existsByName(roleName)) {
                Role role = new Role();
                role.setName(roleName);
                role.setDescription(roleName.getDescription());
                roleRepository.save(role);
                log.info("Created role: {}", roleName);
            }
        }
    }
    
    private void initializeMasterAdmin() {
        if (!userRepository.existsByEmail("admin@medreserve.com")) {
            Role masterAdminRole = roleRepository.findByName(Role.RoleName.MASTER_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Master Admin role not found"));
            
            User masterAdmin = new User();
            masterAdmin.setFirstName("Master");
            masterAdmin.setLastName("Admin");
            masterAdmin.setEmail("admin@medreserve.com");
            masterAdmin.setPassword(passwordEncoder.encode("password123"));
            masterAdmin.setPhoneNumber("+1111111111");
            masterAdmin.setRole(masterAdminRole);
            masterAdmin.setIsActive(true);
            masterAdmin.setEmailVerified(true);

            userRepository.save(masterAdmin);
            log.info("Created master admin user: admin@medreserve.com");
        }
    }

    private void initializeDefaultUsers() {
        // Create default patient
        if (!userRepository.existsByEmail("patient@medreserve.com")) {
            createDefaultPatient();
        }

        // Create default doctor
        if (!userRepository.existsByEmail("doctor@medreserve.com")) {
            createDefaultDoctor();
        }
    }

    private void createDefaultPatient() {
        Role patientRole = roleRepository.findByName(Role.RoleName.PATIENT)
                .orElseThrow(() -> new RuntimeException("Patient role not found"));

        User patient = new User();
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setEmail("patient@medreserve.com");
        patient.setPassword(passwordEncoder.encode("password123"));
        patient.setPhoneNumber("+1234567890");
        patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
        patient.setGender(User.Gender.MALE);
        patient.setRole(patientRole);
        patient.setIsActive(true);
        patient.setEmailVerified(true);

        userRepository.save(patient);
        log.info("Created default patient: patient@medreserve.com");
    }

    private void createDefaultDoctor() {
        Role doctorRole = roleRepository.findByName(Role.RoleName.DOCTOR)
                .orElseThrow(() -> new RuntimeException("Doctor role not found"));

        User doctorUser = new User();
        doctorUser.setFirstName("Dr. Jane");
        doctorUser.setLastName("Smith");
        doctorUser.setEmail("doctor@medreserve.com");
        doctorUser.setPassword(passwordEncoder.encode("password123"));
        doctorUser.setPhoneNumber("+9876543210");
        doctorUser.setDateOfBirth(LocalDate.of(1980, 5, 15));
        doctorUser.setGender(User.Gender.FEMALE);
        doctorUser.setRole(doctorRole);
        doctorUser.setIsActive(true);
        doctorUser.setEmailVerified(true);

        User savedDoctorUser = userRepository.save(doctorUser);

        // Create doctor profile
        Doctor doctor = new Doctor();
        doctor.setUser(savedDoctorUser);
        doctor.setSpecialty("CARDIOLOGY");
        doctor.setQualification("MD, Cardiology");
        doctor.setYearsOfExperience(15);
        doctor.setConsultationFee(new BigDecimal("150.00"));
        doctor.setLicenseNumber("DOC123456");
        doctor.setBiography("Experienced cardiologist with 15 years of practice.");
        doctor.setClinicAddress("123 Medical Center, Healthcare City");
        doctor.setConsultationType(Doctor.ConsultationType.BOTH);
        doctor.setIsAvailable(true);

        doctorRepository.save(doctor);
        log.info("Created default doctor: doctor@medreserve.com");
    }
}
