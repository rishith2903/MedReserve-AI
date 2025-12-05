package com.medreserve.service;

import com.medreserve.dto.DoctorRegistrationRequest;
import com.medreserve.dto.DoctorResponse;
import com.medreserve.dto.MessageResponse;
import com.medreserve.entity.Doctor;
import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.RoleRepository;
import com.medreserve.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {
    
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public MessageResponse registerDoctor(DoctorRegistrationRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return MessageResponse.error("Email is already in use!");
        }
        
        // Check if license number already exists
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            return MessageResponse.error("Medical license number is already registered!");
        }
        
        // Check if phone number already exists
        if (request.getPhoneNumber() != null && 
            userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            return MessageResponse.error("Phone number is already in use!");
        }
        
        // Get doctor role
        Role doctorRole = roleRepository.findByName(Role.RoleName.DOCTOR)
                .orElseThrow(() -> new RuntimeException("Doctor role not found"));
        
        // Create user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setRole(doctorRole);
        user.setIsActive(true);
        user.setEmailVerified(true); // Auto-verify for doctors
        
        user = userRepository.save(user);
        
        // Create doctor profile
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setSubSpecialty(request.getSubSpecialty());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setQualification(request.getQualification());
        doctor.setBiography(request.getBiography());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setHospitalAffiliation(request.getHospitalAffiliation());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setConsultationType(request.getConsultationType());
        
        // Set working hours with defaults if not provided
        doctor.setMorningStartTime(request.getMorningStartTime() != null ? 
                request.getMorningStartTime() : LocalTime.of(10, 0));
        doctor.setMorningEndTime(request.getMorningEndTime() != null ? 
                request.getMorningEndTime() : LocalTime.of(13, 0));
        doctor.setEveningStartTime(request.getEveningStartTime() != null ? 
                request.getEveningStartTime() : LocalTime.of(15, 0));
        doctor.setEveningEndTime(request.getEveningEndTime() != null ? 
                request.getEveningEndTime() : LocalTime.of(18, 0));
        doctor.setSlotDurationMinutes(request.getSlotDurationMinutes());
        
        doctor.setIsAvailable(true);
        
        doctorRepository.save(doctor);
        
        log.info("Doctor registered successfully: {}", user.getEmail());
        return MessageResponse.success("Doctor registered successfully!");
    }
    
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getAllDoctors(Pageable pageable) {
        try {
            Page<Doctor> doctors = doctorRepository.findByIsAvailableTrue(pageable);
            log.info("Found {} doctors", doctors.getTotalElements());
            return doctors.map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Error fetching doctors: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching doctors: " + e.getMessage());
        }
    }
    
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctorsBySpecialty(String specialty, Pageable pageable) {
        Page<Doctor> doctors = doctorRepository.findBySpecialtyAndIsAvailableTrue(specialty, pageable);
        return doctors.map(this::convertToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<DoctorResponse> searchDoctors(String keyword, Pageable pageable) {
        try {
            Page<Doctor> doctors = doctorRepository.searchDoctors(keyword, pageable);
            log.info("Found {} doctors for keyword: {}", doctors.getTotalElements(), keyword);
            return doctors.map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Error searching doctors with keyword '{}': {}", keyword, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error searching doctors: " + e.getMessage());
        }
    }
    
    public List<DoctorResponse> getDoctorsByConsultationFeeRange(BigDecimal minFee, BigDecimal maxFee) {
        List<Doctor> doctors = doctorRepository.findByConsultationFeeBetween(minFee, maxFee);
        return doctors.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public List<DoctorResponse> getDoctorsByMinimumRating(BigDecimal minRating) {
        List<Doctor> doctors = doctorRepository.findByMinimumRating(minRating);
        return doctors.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public List<DoctorResponse> getDoctorsByMinimumExperience(Integer minExperience) {
        List<Doctor> doctors = doctorRepository.findByMinimumExperience(minExperience);
        return doctors.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public Page<DoctorResponse> getTopRatedDoctors(Pageable pageable) {
        Page<Doctor> doctors = doctorRepository.findTopRatedDoctors(pageable);
        return doctors.map(this::convertToResponse);
    }
    
    @Cacheable(cacheNames = "doctorSpecialties", key = "'all'")
    public List<String> getAllSpecialties() {
        return doctorRepository.findAllAvailableSpecialties();
    }
    
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "doctorById", key = "#doctorId")
    public DoctorResponse getDoctorById(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        return convertToResponse(doctor);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "doctorByUserId", key = "#userId")
    public DoctorResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
        return convertToResponse(doctor);
    }
    
    @Transactional
    public DoctorResponse updateDoctorProfile(Long doctorId, DoctorRegistrationRequest request, Long userId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        
        // Check if user has permission to update
        if (!doctor.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this profile");
        }
        
        // Update doctor information
        doctor.setSpecialty(request.getSpecialty());
        doctor.setSubSpecialty(request.getSubSpecialty());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setQualification(request.getQualification());
        doctor.setBiography(request.getBiography());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setHospitalAffiliation(request.getHospitalAffiliation());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setConsultationType(request.getConsultationType());
        
        // Update working hours
        if (request.getMorningStartTime() != null) {
            doctor.setMorningStartTime(request.getMorningStartTime());
        }
        if (request.getMorningEndTime() != null) {
            doctor.setMorningEndTime(request.getMorningEndTime());
        }
        if (request.getEveningStartTime() != null) {
            doctor.setEveningStartTime(request.getEveningStartTime());
        }
        if (request.getEveningEndTime() != null) {
            doctor.setEveningEndTime(request.getEveningEndTime());
        }
        if (request.getSlotDurationMinutes() != null) {
            doctor.setSlotDurationMinutes(request.getSlotDurationMinutes());
        }
        
        // Update user information
        User user = doctor.getUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        
        userRepository.save(user);
        doctor = doctorRepository.save(doctor);
        
        log.info("Doctor profile updated: {}", doctor.getUser().getEmail());
        return convertToResponse(doctor);
    }
    
    @Transactional
    public MessageResponse toggleDoctorAvailability(Long doctorId, Long userId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        
        // Check if user has permission
        if (!doctor.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this profile");
        }
        
        doctor.setIsAvailable(!doctor.getIsAvailable());
        doctorRepository.save(doctor);
        
        String status = doctor.getIsAvailable() ? "available" : "unavailable";
        log.info("Doctor availability updated: {} is now {}", doctor.getUser().getEmail(), status);
        
        return MessageResponse.success("Doctor is now " + status);
    }
    
    private DoctorResponse convertToResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setUserId(doctor.getUser().getId());
        response.setFirstName(doctor.getUser().getFirstName());
        response.setLastName(doctor.getUser().getLastName());
        response.setFullName(doctor.getFullName());
        response.setEmail(doctor.getEmail());
        response.setPhoneNumber(doctor.getPhoneNumber());
        response.setLicenseNumber(doctor.getLicenseNumber());
        response.setSpecialty(doctor.getSpecialty());
        response.setSubSpecialty(doctor.getSubSpecialty());
        response.setYearsOfExperience(doctor.getYearsOfExperience());
        response.setQualification(doctor.getQualification());
        response.setBiography(doctor.getBiography());
        response.setConsultationFee(doctor.getConsultationFee());
        response.setMorningStartTime(doctor.getMorningStartTime());
        response.setMorningEndTime(doctor.getMorningEndTime());
        response.setEveningStartTime(doctor.getEveningStartTime());
        response.setEveningEndTime(doctor.getEveningEndTime());
        response.setSlotDurationMinutes(doctor.getSlotDurationMinutes());
        response.setIsAvailable(doctor.getIsAvailable());
        response.setHospitalAffiliation(doctor.getHospitalAffiliation());
        response.setClinicAddress(doctor.getClinicAddress());
        response.setConsultationType(doctor.getConsultationType());
        response.setAverageRating(doctor.getAverageRating());
        response.setTotalReviews(doctor.getTotalReviews());
        
        return response;
    }
}
