package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medreserve.entity.MedicalReport;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicalReportRequest {
    
    @NotBlank(message = "Report title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Report type is required")
    private MedicalReport.ReportType reportType;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime reportDate;
    
    @Size(max = 255, message = "Lab name cannot exceed 255 characters")
    private String labName;
    
    @Size(max = 255, message = "Doctor name cannot exceed 255 characters")
    private String doctorName;
    
    private Long appointmentId;
    
    private Boolean shareWithDoctor = false;
}
