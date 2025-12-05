package com.medreserve.controller;

import com.medreserve.dto.MedicalReportRequest;
import com.medreserve.dto.MedicalReportResponse;
import com.medreserve.dto.MessageResponse;
import com.medreserve.entity.MedicalReport;
import com.medreserve.entity.User;
import com.medreserve.service.MedicalReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import com.medreserve.security.RateLimitService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

import java.util.List;

@RestController
@RequestMapping("/medical-reports")
@RequiredArgsConstructor
@Tag(name = "Medical Reports", description = "Medical report management APIs")
public class MedicalReportController {
    
    private final MedicalReportService medicalReportService;
    private final RateLimitService rateLimitService;
    
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Upload medical report", description = "Upload a medical report file (PDF/Image)")
    public ResponseEntity<MedicalReportResponse> uploadReport(
            @RequestPart("file") MultipartFile file,
            @RequestPart("report") @Valid MedicalReportRequest request,
            @AuthenticationPrincipal User currentUser) {
        // Rate limit uploads per user
        rateLimitService.checkUploadAllowed("user:" + currentUser.getId());
        MedicalReportResponse response = medicalReportService.uploadReport(file, request, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient reports", description = "Get all medical reports for the current patient")
    public ResponseEntity<Page<MedicalReportResponse>> getMyReports(
            @AuthenticationPrincipal User currentUser,
            Pageable pageable) {
        Page<MedicalReportResponse> reports = medicalReportService.getPatientReports(currentUser.getId(), pageable);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/my-reports/type/{reportType}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get reports by type", description = "Get patient reports filtered by type")
    public ResponseEntity<List<MedicalReportResponse>> getReportsByType(
            @PathVariable MedicalReport.ReportType reportType,
            @AuthenticationPrincipal User currentUser) {
        List<MedicalReportResponse> reports = medicalReportService.getPatientReportsByType(currentUser.getId(), reportType);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get appointment reports", description = "Get all reports for a specific appointment")
    public ResponseEntity<List<MedicalReportResponse>> getAppointmentReports(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal User currentUser) {
        List<MedicalReportResponse> reports = medicalReportService.getAppointmentReports(appointmentId, currentUser.getId());
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/shared")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get shared reports", description = "Get all reports shared with the current doctor")
    public ResponseEntity<List<MedicalReportResponse>> getSharedReports(@AuthenticationPrincipal User currentUser) {
        // Note: This assumes doctor ID can be derived from user ID
        List<MedicalReportResponse> reports = medicalReportService.getSharedReportsByDoctor(currentUser.getId());
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/{reportId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get report details", description = "Get details of a specific medical report")
    public ResponseEntity<MedicalReportResponse> getReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal User currentUser) {
        MedicalReportResponse report = medicalReportService.getReportById(reportId, currentUser.getId());
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/{reportId}/download")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Download report file", description = "Download the medical report file")
    public ResponseEntity<Resource> downloadReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal User currentUser) {
        Resource resource = medicalReportService.downloadReport(reportId, currentUser.getId());

        // Determine content type safely
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String detected = Files.probeContentType(resource.getFile().toPath());
            if (detected != null && !detected.isBlank()) {
                mediaType = MediaType.parseMediaType(detected);
            }
        } catch (Exception ignored) { }

        // Prefer original filename in download headers when available
        MedicalReportResponse details = medicalReportService.getReportById(reportId, currentUser.getId());
        String downloadName = (details.getOriginalFileName() != null && !details.getOriginalFileName().isBlank())
                ? details.getOriginalFileName()
                : resource.getFilename();

        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(downloadName, StandardCharsets.UTF_8)
                .build();

        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
.header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header("X-Content-Type-Options", "nosniff");
        try {
            builder.contentLength(resource.contentLength());
        } catch (IOException ignored) { }

        return builder.body(resource);
    }
    
    @PostMapping("/{reportId}/share")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Share report with doctor", description = "Share a medical report with a doctor for a specific appointment")
    public ResponseEntity<MessageResponse> shareReportWithDoctor(
            @PathVariable Long reportId,
            @RequestParam Long appointmentId,
            @AuthenticationPrincipal User currentUser) {
        MessageResponse response = medicalReportService.shareReportWithDoctor(reportId, appointmentId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{reportId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Delete report", description = "Delete a medical report")
    public ResponseEntity<MessageResponse> deleteReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal User currentUser) {
        MessageResponse response = medicalReportService.deleteReport(reportId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Search reports", description = "Search medical reports by keyword")
    public ResponseEntity<List<MedicalReportResponse>> searchReports(
            @RequestParam String keyword,
            @AuthenticationPrincipal User currentUser) {
        List<MedicalReportResponse> reports = medicalReportService.searchReports(currentUser.getId(), keyword);
        return ResponseEntity.ok(reports);
    }
}
