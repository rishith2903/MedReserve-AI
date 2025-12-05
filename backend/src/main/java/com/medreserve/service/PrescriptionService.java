package com.medreserve.service;

import com.medreserve.dto.MessageResponse;
import com.medreserve.dto.PrescriptionRequest;
import com.medreserve.dto.PrescriptionResponse;
import com.medreserve.entity.Appointment;
import com.medreserve.entity.Doctor;
import com.medreserve.entity.Prescription;
import com.medreserve.repository.AppointmentRepository;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {
    
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final FileStorageService fileStorageService;
    
    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request, Long doctorUserId) {
        // Get doctor profile
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
        
        // Validate appointment
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        // Check if doctor owns the appointment
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to create prescription for this appointment");
        }
        
        // Create prescription
        Prescription prescription = new Prescription();
        prescription.setAppointment(appointment);
        prescription.setDoctor(doctor);
        prescription.setPatient(appointment.getPatient());
        prescription.setMedications(request.getMedications());
        prescription.setDosage(request.getDosage());
        prescription.setInstructions(request.getInstructions());
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setNotes(request.getNotes());
        prescription.setPrescriptionDate(request.getPrescriptionDate() != null ? 
                request.getPrescriptionDate() : LocalDateTime.now());
        prescription.setValidUntil(request.getValidUntil());
        prescription.setStatus(request.getStatus());
        prescription.setIsDigital(request.getIsDigital());
        
        prescription = prescriptionRepository.save(prescription);
        
        log.info("Prescription created successfully: ID={}, Doctor={}, Patient={}", 
                prescription.getId(), doctor.getUser().getEmail(), appointment.getPatient().getEmail());
        
        return convertToResponse(prescription);
    }
    
    @Transactional
    public PrescriptionResponse createPrescriptionWithFile(MultipartFile file, PrescriptionRequest request, Long doctorUserId) {
        // Create prescription first
        PrescriptionResponse prescriptionResponse = createPrescription(request, doctorUserId);
        
        // Store file if provided
        if (file != null && !file.isEmpty()) {
            Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
            
            String fileName = fileStorageService.storePrescriptionFile(file, doctor.getId());
            String filePath = fileStorageService.getFilePath(fileName, "prescriptions");
            
            // Update prescription with file info
            Prescription prescription = prescriptionRepository.findById(prescriptionResponse.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
            
            prescription.setFileName(fileName);
            prescription.setOriginalFileName(file.getOriginalFilename());
            prescription.setFilePath(filePath);
            prescription.setFileSize(file.getSize());
            prescription.setContentType(file.getContentType());
            // Compute checksum for auditing/integrity
            try {
                String checksum = fileStorageService.calculateChecksum("prescriptions", fileName);
                prescription.setSha256Checksum(checksum);
            } catch (Exception ignored) { }
            
            prescription = prescriptionRepository.save(prescription);
            
            log.info("Prescription file attached: ID={}, File={}", prescription.getId(), fileName);
            
            return convertToResponse(prescription);
        }
        
        return prescriptionResponse;
    }
    
    public Page<PrescriptionResponse> getPatientPrescriptions(Long patientId, Pageable pageable) {
        Page<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId, pageable);
        return prescriptions.map(this::convertToResponse);
    }
    
    public Page<PrescriptionResponse> getDoctorPrescriptions(Long doctorUserId, Pageable pageable) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
        
        Page<Prescription> prescriptions = prescriptionRepository.findByDoctorId(doctor.getId(), pageable);
        return prescriptions.map(this::convertToResponse);
    }
    
    public List<PrescriptionResponse> getAppointmentPrescriptions(Long appointmentId, Long userId) {
        // Validate appointment access
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        if (!appointment.getPatient().getId().equals(userId) && 
            !appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this appointment");
        }
        
        List<Prescription> prescriptions = prescriptionRepository.findByAppointmentId(appointmentId);
        return prescriptions.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public PrescriptionResponse getPrescriptionById(Long prescriptionId, Long userId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
        
        // Check access permissions
        if (!prescription.getPatient().getId().equals(userId) && 
            !prescription.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this prescription");
        }
        
        return convertToResponse(prescription);
    }
    
    public Resource downloadPrescription(Long prescriptionId, Long userId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
        
        // Check access permissions
        if (!prescription.getPatient().getId().equals(userId) && 
            !prescription.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to download this prescription");
        }
        
        if (!prescription.hasAttachment()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription has no file attachment");
        }
        
        log.info("Prescription download: prescriptionId={}, requestedByUserId={}", prescriptionId, userId);
        return fileStorageService.loadFileAsResource(prescription.getFileName(), "prescriptions");
    }
    
    @Transactional
    public PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionRequest request, Long doctorUserId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
        
        // Check if doctor owns the prescription
        if (!prescription.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this prescription");
        }
        
        // Update prescription
        prescription.setMedications(request.getMedications());
        prescription.setDosage(request.getDosage());
        prescription.setInstructions(request.getInstructions());
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setNotes(request.getNotes());
        prescription.setValidUntil(request.getValidUntil());
        prescription.setStatus(request.getStatus());
        
        prescription = prescriptionRepository.save(prescription);
        
        log.info("Prescription updated: ID={}, Doctor={}", prescriptionId, prescription.getDoctor().getUser().getEmail());
        
        return convertToResponse(prescription);
    }
    
    @Transactional
    public MessageResponse deletePrescription(Long prescriptionId, Long doctorUserId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
        
        // Check if doctor owns the prescription
        if (!prescription.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this prescription");
        }
        
        // Delete file if exists
        if (prescription.hasAttachment()) {
            fileStorageService.deleteFile(prescription.getFileName(), "prescriptions");
        }
        
        // Delete from database
        prescriptionRepository.delete(prescription);
        
        log.info("Prescription deleted: ID={}, Doctor={}", prescriptionId, prescription.getDoctor().getUser().getEmail());
        
        return MessageResponse.success("Prescription deleted successfully");
    }
    
    public List<PrescriptionResponse> searchPrescriptions(Long patientId, String keyword) {
        List<Prescription> prescriptions = prescriptionRepository.searchByPatientAndKeyword(patientId, keyword);
        return prescriptions.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public void updateExpiredPrescriptions() {
        List<Prescription> expiredPrescriptions = prescriptionRepository.findExpiredPrescriptions(LocalDateTime.now());
        
        for (Prescription prescription : expiredPrescriptions) {
            prescription.setStatus(Prescription.PrescriptionStatus.EXPIRED);
        }
        
        if (!expiredPrescriptions.isEmpty()) {
            prescriptionRepository.saveAll(expiredPrescriptions);
            log.info("Updated {} expired prescriptions", expiredPrescriptions.size());
        }
    }
    
    private PrescriptionResponse convertToResponse(Prescription prescription) {
        PrescriptionResponse response = new PrescriptionResponse();
        response.setId(prescription.getId());
        response.setAppointmentId(prescription.getAppointment().getId());
        response.setDoctorId(prescription.getDoctor().getId());
        response.setDoctorName(prescription.getDoctorName());
        response.setPatientId(prescription.getPatient().getId());
        response.setPatientName(prescription.getPatientName());
        response.setMedications(prescription.getMedications());
        response.setDosage(prescription.getDosage());
        response.setInstructions(prescription.getInstructions());
        response.setDiagnosis(prescription.getDiagnosis());
        response.setNotes(prescription.getNotes());
        response.setFileName(prescription.getFileName());
        response.setOriginalFileName(prescription.getOriginalFileName());
        response.setFileSize(prescription.getFileSize());
        response.setContentType(prescription.getContentType());
        response.setSha256Checksum(prescription.getSha256Checksum());
        response.setPrescriptionDate(prescription.getPrescriptionDate());
        response.setValidUntil(prescription.getValidUntil());
        response.setStatus(prescription.getStatus());
        response.setIsDigital(prescription.getIsDigital());
        response.setCreatedAt(prescription.getCreatedAt());
        response.setUpdatedAt(prescription.getUpdatedAt());
        
        return response;
    }
}
