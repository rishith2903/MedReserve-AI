package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medreserve.entity.ChatSession;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatSessionResponse {
    
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private ChatSession.ChatStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastMessageAt;
    
    private Integer totalMessages;
    private Boolean isEncrypted;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Additional info
    private Long unreadMessageCount;
    private ChatMessageResponse lastMessage;
    
    // Helper methods
    public boolean isActive() {
        return status == ChatSession.ChatStatus.ACTIVE;
    }
}
