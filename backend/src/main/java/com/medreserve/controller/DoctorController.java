package com.medreserve.controller;

import com.medreserve.dto.DoctorRegistrationRequest;
import com.medreserve.dto.DoctorResponse;
import com.medreserve.dto.MessageResponse;
import com.medreserve.entity.User;
import com.medreserve.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Doctors", description = "Doctor management APIs")
public class DoctorController {
    
    private final DoctorService doctorService;
    
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MASTER_ADMIN')")
    @Operation(summary = "Register doctor", description = "Register a new doctor (Admin only)")
    public ResponseEntity<MessageResponse> registerDoctor(@Valid @RequestBody DoctorRegistrationRequest request) {
        MessageResponse response = doctorService.registerDoctor(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping
    @Operation(summary = "Get all doctors", description = "Get all available doctors with pagination")
    public ResponseEntity<Page<DoctorResponse>> getAllDoctors(Pageable pageable) {
        try {
            log.info("Fetching all doctors with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());
            Page<DoctorResponse> doctors = doctorService.getAllDoctors(pageable);
            log.info("Successfully fetched {} doctors", doctors.getTotalElements());
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            log.error("Error fetching all doctors: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error fetching doctors: " + e.getMessage());
        }
    }
    
    @GetMapping("/{doctorId}")
    @Operation(summary = "Get doctor by ID", description = "Get doctor details by ID")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long doctorId) {
        DoctorResponse doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(doctor);
    }
    
    @GetMapping("/specialty/{specialty}")
    @Operation(summary = "Get doctors by specialty", description = "Get doctors filtered by specialty")
    public ResponseEntity<Page<DoctorResponse>> getDoctorsBySpecialty(
            @PathVariable String specialty,
            Pageable pageable) {
        Page<DoctorResponse> doctors = doctorService.getDoctorsBySpecialty(specialty, pageable);
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search doctors", description = "Search doctors by name, specialty, or keywords")
    public ResponseEntity<Page<DoctorResponse>> searchDoctors(
            @RequestParam String keyword,
            Pageable pageable) {
        try {
            log.info("Searching doctors with keyword: '{}', page={}, size={}",
                keyword, pageable.getPageNumber(), pageable.getPageSize());
            Page<DoctorResponse> doctors = doctorService.searchDoctors(keyword, pageable);
            log.info("Search found {} doctors for keyword: '{}'", doctors.getTotalElements(), keyword);
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            log.error("Error searching doctors with keyword '{}': {}", keyword, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error searching doctors: " + e.getMessage());
        }
    }
    
    @GetMapping("/filter/fee-range")
    @Operation(summary = "Filter doctors by fee range", description = "Get doctors within a consultation fee range")
    public ResponseEntity<List<DoctorResponse>> getDoctorsByFeeRange(
            @RequestParam BigDecimal minFee,
            @RequestParam BigDecimal maxFee) {
        List<DoctorResponse> doctors = doctorService.getDoctorsByConsultationFeeRange(minFee, maxFee);
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/filter/rating")
    @Operation(summary = "Filter doctors by rating", description = "Get doctors with minimum rating")
    public ResponseEntity<List<DoctorResponse>> getDoctorsByRating(
            @RequestParam BigDecimal minRating) {
        List<DoctorResponse> doctors = doctorService.getDoctorsByMinimumRating(minRating);
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/filter/experience")
    @Operation(summary = "Filter doctors by experience", description = "Get doctors with minimum years of experience")
    public ResponseEntity<List<DoctorResponse>> getDoctorsByExperience(
            @RequestParam Integer minExperience) {
        List<DoctorResponse> doctors = doctorService.getDoctorsByMinimumExperience(minExperience);
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/top-rated")
    @Operation(summary = "Get top-rated doctors", description = "Get top-rated doctors")
    public ResponseEntity<Page<DoctorResponse>> getTopRatedDoctors(Pageable pageable) {
        Page<DoctorResponse> doctors = doctorService.getTopRatedDoctors(pageable);
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/specialties")
    @Operation(summary = "Get all specialties", description = "Get list of all available medical specialties")
    public ResponseEntity<List<String>> getAllSpecialties() {
        List<String> specialties = doctorService.getAllSpecialties();
        return ResponseEntity.ok(specialties);
    }
    
    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor profile", description = "Get current doctor's profile")
    public ResponseEntity<DoctorResponse> getMyProfile(@AuthenticationPrincipal User currentUser) {
        DoctorResponse doctor = doctorService.getDoctorByUserId(currentUser.getId());
        return ResponseEntity.ok(doctor);
    }
    
    @PutMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MASTER_ADMIN') or (hasRole('DOCTOR') and @authzService.isSelfDoctorId(#doctorId))")
    @Operation(summary = "Update doctor profile", description = "Update doctor profile information")
    public ResponseEntity<DoctorResponse> updateDoctorProfile(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorRegistrationRequest request,
            @AuthenticationPrincipal User currentUser) {
        DoctorResponse doctor = doctorService.updateDoctorProfile(doctorId, request, currentUser.getId());
        return ResponseEntity.ok(doctor);
    }
    
    @PutMapping("/{doctorId}/toggle-availability")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MASTER_ADMIN') or (hasRole('DOCTOR') and @authzService.isSelfDoctorId(#doctorId))")
    @Operation(summary = "Toggle availability", description = "Toggle doctor availability status")
    public ResponseEntity<MessageResponse> toggleAvailability(
            @PathVariable Long doctorId,
            @AuthenticationPrincipal User currentUser) {
        MessageResponse response = doctorService.toggleDoctorAvailability(doctorId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
}
