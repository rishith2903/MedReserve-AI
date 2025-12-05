package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medreserve.entity.MedicalReport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReportResponse {
    
    private Long id;
    private Long patientId;
    private String patientName;
    private Long appointmentId;
    private String title;
    private String description;
    private String fileName;
    private String originalFileName;
    private Long fileSize;
    private String contentType;
    private String sha256Checksum;
    private MedicalReport.ReportType reportType;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime reportDate;
    
    private String labName;
    private String doctorName;
    private Boolean isSharedWithDoctor;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime sharedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public String getFileExtension() {
        if (originalFileName != null && originalFileName.contains(".")) {
            return originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return "";
    }
    
    public boolean isPdf() {
        return "application/pdf".equals(contentType);
    }
    
    public boolean isImage() {
        return contentType != null && contentType.startsWith("image/");
    }
    
    public String getFileSizeFormatted() {
        if (fileSize == null) return "0 B";
        
        long bytes = fileSize;
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
}
