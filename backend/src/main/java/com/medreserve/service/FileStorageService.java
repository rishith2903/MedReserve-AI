package com.medreserve.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import com.medreserve.security.AntivirusScannerService;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Formatter;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {
    
    private final Path fileStorageLocation;
    private final AntivirusScannerService antivirusScannerService;
    
    // Allowed file types for medical reports
    private static final List<String> ALLOWED_REPORT_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/jpg", 
            "image/png",
            "image/gif",
            "image/bmp",
            "image/tiff"
    );
    
    // Allowed file types for prescriptions (mainly PDF)
    private static final List<String> ALLOWED_PRESCRIPTION_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );
    
    // Maximum file size (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    public FileStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir,
                               AntivirusScannerService antivirusScannerService) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.antivirusScannerService = antivirusScannerService;
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            
            // Create subdirectories
            Files.createDirectories(this.fileStorageLocation.resolve("reports"));
            Files.createDirectories(this.fileStorageLocation.resolve("prescriptions"));
            
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }
    
    public String storeReportFile(MultipartFile file, Long patientId) {
        return storeFile(file, "reports", patientId, ALLOWED_REPORT_TYPES);
    }
    
    public String storePrescriptionFile(MultipartFile file, Long doctorId) {
        return storeFile(file, "prescriptions", doctorId, ALLOWED_PRESCRIPTION_TYPES);
    }
    
    private String storeFile(MultipartFile file, String category, Long userId, List<String> allowedTypes) {
        // Validate file
        validateFile(file, allowedTypes);
        
        // Generate unique filename
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFileName = String.format("%s_%s_%s_%s%s", 
                category, userId, timestamp, UUID.randomUUID().toString().substring(0, 8), fileExtension);
        
        try {
            // Check if the filename contains invalid characters
            if (originalFileName.contains("..")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Filename contains invalid path sequence " + originalFileName);
            }
            
            // Copy file to the target location
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Path targetLocation = categoryPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("File stored successfully: {} -> {}", originalFileName, uniqueFileName);
            return uniqueFileName;
            
        } catch (IOException ex) {
            log.error("Could not store file {}. Error: {}", originalFileName, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Could not store file " + originalFileName + ". Please try again!");
        }
    }
    
    public Resource loadFileAsResource(String fileName, String category) {
        try {
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Path filePath = categoryPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found " + fileName);
        }
    }
    
    public void deleteFile(String fileName, String category) {
        try {
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Path filePath = categoryPath.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            log.info("File deleted successfully: {}", fileName);
        } catch (IOException ex) {
            log.error("Could not delete file {}. Error: {}", fileName, ex.getMessage());
        }
    }
    
    public String getFilePath(String fileName, String category) {
        Path categoryPath = this.fileStorageLocation.resolve(category);
        return categoryPath.resolve(fileName).toString();
    }
    
    private void validateFile(MultipartFile file, List<String> allowedTypes) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select a file to upload");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "File size exceeds maximum allowed size of 10MB");
        }
        
        // Prefer content-based detection; fall back to provided content-type header
        String declaredContentType = file.getContentType();
        String detectedContentType = detectMimeType(file);
        boolean allowedByDetection = detectedContentType != null && allowedTypes.contains(detectedContentType.toLowerCase());
        boolean allowedByHeader = declaredContentType != null && allowedTypes.contains(declaredContentType.toLowerCase());
        
        if (!allowedByDetection && !allowedByHeader) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "File type not allowed. Allowed types: " + String.join(", ", allowedTypes));
        }
        
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name is required");
        }
        
        // Optional antivirus scan (feature-flagged)
        antivirusScannerService.assertClean(file);
    }
    
    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf("."));
        }
        return "";
    }

    private String detectMimeType(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[16];
            int read = is.read(header);
            if (read <= 0) return null;

            // PDF: 25 50 44 46 2D => %PDF-
            if (read >= 5 && header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46 && header[4] == 0x2D) {
                return "application/pdf";
            }
            // JPEG: FF D8 FF
            if (read >= 3 && (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
                return "image/jpeg";
            }
            // PNG: 89 50 4E 47 0D 0A 1A 0A
            if (read >= 8 && (header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 &&
                    header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A) {
                return "image/png";
            }
            // GIF: GIF87a or GIF89a
            if (read >= 6 && header[0] == 'G' && header[1] == 'I' && header[2] == 'F' && header[3] == '8' &&
                    (header[4] == '7' || header[4] == '9') && header[5] == 'a') {
                return "image/gif";
            }
            // BMP: 42 4D (BM)
            if (read >= 2 && header[0] == 'B' && header[1] == 'M') {
                return "image/bmp";
            }
            // TIFF: II*\0 or MM\0*
            if (read >= 4 && ((header[0] == 'I' && header[1] == 'I' && header[2] == 0x2A && header[3] == 0x00) ||
                    (header[0] == 'M' && header[1] == 'M' && header[2] == 0x00 && header[3] == 0x2A))) {
                return "image/tiff";
            }
        } catch (IOException e) {
            log.warn("Could not detect MIME type by magic bytes: {}", e.getMessage());
        }
        return null;
    }
    
    public String calculateChecksum(String category, String fileName) {
        try {
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Path filePath = categoryPath.resolve(fileName).normalize();
            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found " + fileName);
            }
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            try (InputStream is = Files.newInputStream(filePath)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = is.read(buffer)) != -1) {
                    md.update(buffer, 0, read);
                }
            }
            byte[] digest = md.digest();
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("Failed to compute checksum for {} in {}: {}", fileName, category, e.getMessage());
            return null;
        }
    }
    
    public boolean isValidReportFile(MultipartFile file) {
        try {
            validateFile(file, ALLOWED_REPORT_TYPES);
            return true;
        } catch (ResponseStatusException e) {
            return false;
        }
    }
    
    public boolean isValidPrescriptionFile(MultipartFile file) {
        try {
            validateFile(file, ALLOWED_PRESCRIPTION_TYPES);
            return true;
        } catch (ResponseStatusException e) {
            return false;
        }
    }
}
