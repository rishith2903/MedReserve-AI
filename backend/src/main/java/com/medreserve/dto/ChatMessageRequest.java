package com.medreserve.dto;

import com.medreserve.entity.ChatMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatMessageRequest {
    
    @NotNull(message = "Chat session ID is required")
    private Long chatSessionId;
    
    @NotBlank(message = "Message content is required")
    @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
    private String messageContent;
    
    private ChatMessage.MessageType messageType = ChatMessage.MessageType.TEXT;
    
    // For file attachments
    private String fileName;
    private String contentType;
    private Long fileSize;
}
