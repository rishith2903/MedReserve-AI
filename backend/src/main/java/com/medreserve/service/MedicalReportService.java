package com.medreserve.service;

import com.medreserve.dto.MedicalReportRequest;
import com.medreserve.dto.MedicalReportResponse;
import com.medreserve.dto.MessageResponse;
import com.medreserve.entity.Appointment;
import com.medreserve.entity.MedicalReport;
import com.medreserve.entity.User;
import com.medreserve.repository.AppointmentRepository;
import com.medreserve.repository.MedicalReportRepository;
import com.medreserve.repository.UserRepository;
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
public class MedicalReportService {
    
    private final MedicalReportRepository medicalReportRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final FileStorageService fileStorageService;
    
    @Transactional
    public MedicalReportResponse uploadReport(MultipartFile file, MedicalReportRequest request, Long patientId) {
        // Validate patient
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        
        // Validate appointment if provided
        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
            
            // Check if patient owns the appointment
            if (!appointment.getPatient().getId().equals(patientId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this appointment");
            }
        }
        
        // Store file
        String fileName = fileStorageService.storeReportFile(file, patientId);
        String filePath = fileStorageService.getFilePath(fileName, "reports");
        
        // Create medical report entity
        MedicalReport report = new MedicalReport();
        report.setPatient(patient);
        report.setAppointment(appointment);
        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setFileName(fileName);
        report.setOriginalFileName(file.getOriginalFilename());
        report.setFilePath(filePath);
        report.setFileSize(file.getSize());
        report.setContentType(file.getContentType());
        // Compute checksum for auditing/integrity
        try {
            String checksum = fileStorageService.calculateChecksum("reports", fileName);
            report.setSha256Checksum(checksum);
        } catch (Exception ignored) { }
        report.setReportType(request.getReportType());
        report.setReportDate(request.getReportDate() != null ? request.getReportDate() : LocalDateTime.now());
        report.setLabName(request.getLabName());
        report.setDoctorName(request.getDoctorName());
        report.setIsSharedWithDoctor(request.getShareWithDoctor());
        
        if (request.getShareWithDoctor() && appointment != null) {
            report.setSharedAt(LocalDateTime.now());
        }
        
        report = medicalReportRepository.save(report);
        
        log.info("Medical report uploaded successfully: ID={}, Patient={}, File={}", 
                report.getId(), patient.getEmail(), fileName);
        
        return convertToResponse(report);
    }
    
    public Page<MedicalReportResponse> getPatientReports(Long patientId, Pageable pageable) {
        Page<MedicalReport> reports = medicalReportRepository.findByPatientId(patientId, pageable);
        return reports.map(this::convertToResponse);
    }
    
    public List<MedicalReportResponse> getPatientReportsByType(Long patientId, MedicalReport.ReportType reportType) {
        List<MedicalReport> reports = medicalReportRepository.findByPatientIdAndReportType(patientId, reportType);
        return reports.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public List<MedicalReportResponse> getAppointmentReports(Long appointmentId, Long userId) {
        // Validate appointment access
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        if (!appointment.getPatient().getId().equals(userId) && 
            !appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this appointment");
        }
        
        List<MedicalReport> reports = medicalReportRepository.findByAppointmentId(appointmentId);
        return reports.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public List<MedicalReportResponse> getSharedReportsByDoctor(Long doctorId) {
        List<MedicalReport> reports = medicalReportRepository.findSharedReportsByDoctor(doctorId);
        return reports.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public MedicalReportResponse getReportById(Long reportId, Long userId) {
        MedicalReport report = medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medical report not found"));
        
        // Check access permissions
        boolean hasAccess = report.getPatient().getId().equals(userId);
        
        // Check if doctor has access to shared report
        if (!hasAccess && report.getIsSharedWithDoctor() && report.getAppointment() != null) {
            hasAccess = report.getAppointment().getDoctor().getUser().getId().equals(userId);
        }
        
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this report");
        }
        
        return convertToResponse(report);
    }
    
    @Transactional(readOnly = true)
    public Resource downloadReport(Long reportId, Long userId) {
        MedicalReport report = medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medical report not found"));
        
        // Check access permissions
        boolean hasAccess = report.getPatient().getId().equals(userId);
        
        // Check if doctor has access to shared report
        if (!hasAccess && report.getIsSharedWithDoctor() && report.getAppointment() != null) {
            hasAccess = report.getAppointment().getDoctor().getUser().getId().equals(userId);
        }
        
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to download this report");
        }
        
        log.info("Medical report download: reportId={}, requestedByUserId={}", reportId, userId);
        return fileStorageService.loadFileAsResource(report.getFileName(), "reports");
    }
    
    @Transactional
    public MessageResponse shareReportWithDoctor(Long reportId, Long appointmentId, Long patientId) {
        MedicalReport report = medicalReportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medical report not found"));
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this appointment");
        }
        
        report.setAppointment(appointment);
        report.setIsSharedWithDoctor(true);
        report.setSharedAt(LocalDateTime.now());
        
        medicalReportRepository.save(report);
        
        log.info("Medical report shared with doctor: ReportID={}, AppointmentID={}, DoctorID={}", 
                reportId, appointmentId, appointment.getDoctor().getId());
        
        return MessageResponse.success("Report shared with doctor successfully");
    }
    
    @Transactional
    public MessageResponse deleteReport(Long reportId, Long patientId) {
        MedicalReport report = medicalReportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medical report not found"));
        
        // Delete file from storage
        fileStorageService.deleteFile(report.getFileName(), "reports");
        
        // Delete from database
        medicalReportRepository.delete(report);
        
        log.info("Medical report deleted: ID={}, Patient={}", reportId, report.getPatient().getEmail());
        
        return MessageResponse.success("Medical report deleted successfully");
    }
    
    public List<MedicalReportResponse> searchReports(Long patientId, String keyword) {
        List<MedicalReport> reports = medicalReportRepository.searchByPatientAndKeyword(patientId, keyword);
        return reports.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    private MedicalReportResponse convertToResponse(MedicalReport report) {
        MedicalReportResponse response = new MedicalReportResponse();
        response.setId(report.getId());
        response.setPatientId(report.getPatient().getId());
        response.setPatientName(report.getPatient().getFullName());
        response.setAppointmentId(report.getAppointment() != null ? report.getAppointment().getId() : null);
        response.setTitle(report.getTitle());
        response.setDescription(report.getDescription());
        response.setFileName(report.getFileName());
        response.setOriginalFileName(report.getOriginalFileName());
        response.setFileSize(report.getFileSize());
        response.setContentType(report.getContentType());
        response.setSha256Checksum(report.getSha256Checksum());
        response.setReportType(report.getReportType());
        response.setReportDate(report.getReportDate());
        response.setLabName(report.getLabName());
        response.setDoctorName(report.getDoctorName());
        response.setIsSharedWithDoctor(report.getIsSharedWithDoctor());
        response.setSharedAt(report.getSharedAt());
        response.setCreatedAt(report.getCreatedAt());
        response.setUpdatedAt(report.getUpdatedAt());

        return response;
    }
}
