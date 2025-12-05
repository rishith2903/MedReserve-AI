package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medreserve.entity.ChatMessage;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageResponse {
    
    private Long id;
    private Long chatSessionId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String messageContent;
    private ChatMessage.MessageType messageType;
    private ChatMessage.MessageStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime sentAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deliveredAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime readAt;
    
    private Boolean isEncrypted;
    
    // File attachment info
    private String fileName;
    private Long fileSize;
    private String contentType;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Helper methods
    public boolean isRead() {
        return status == ChatMessage.MessageStatus.READ;
    }
    
    public boolean isDelivered() {
        return status == ChatMessage.MessageStatus.DELIVERED || status == ChatMessage.MessageStatus.READ;
    }
    
    public boolean hasAttachment() {
        return fileName != null && !fileName.isEmpty();
    }
}
