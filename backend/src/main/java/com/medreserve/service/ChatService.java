package com.medreserve.service;

import com.medreserve.dto.ChatMessageRequest;
import com.medreserve.dto.ChatMessageResponse;
import com.medreserve.dto.ChatSessionResponse;
import com.medreserve.dto.MessageResponse;
import com.medreserve.entity.*;
import com.medreserve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public ChatSessionResponse createChatSession(Long appointmentId, Long userId) {
        // Validate appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        // Check if user has permission to create chat session
        if (!appointment.getPatient().getId().equals(userId) && 
            !appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to create chat session for this appointment");
        }
        
        // Check if appointment is active
        if (!appointment.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot create chat session for inactive appointment");
        }
        
        // Check if chat session already exists
        if (chatSessionRepository.findByAppointmentId(appointmentId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chat session already exists for this appointment");
        }
        
        // Create chat session
        ChatSession chatSession = new ChatSession();
        chatSession.setAppointment(appointment);
        chatSession.setPatient(appointment.getPatient());
        chatSession.setDoctor(appointment.getDoctor());
        chatSession.setStatus(ChatSession.ChatStatus.ACTIVE);
        chatSession.setStartedAt(LocalDateTime.now());
        chatSession.setIsEncrypted(true);
        
        chatSession = chatSessionRepository.save(chatSession);
        
        log.info("Chat session created: ID={}, Appointment={}", chatSession.getId(), appointmentId);
        
        return convertToSessionResponse(chatSession);
    }
    
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request, Long senderId) {
        // Validate chat session
        ChatSession chatSession = chatSessionRepository.findById(request.getChatSessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));
        
        // Check if user has permission to send message
        if (!chatSession.getPatient().getId().equals(senderId) && 
            !chatSession.getDoctor().getUser().getId().equals(senderId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to send message in this chat session");
        }
        
        // Check if chat session is active
        if (!chatSession.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send message to inactive chat session");
        }
        
        // Get sender
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
        
        // Create message
        ChatMessage message = new ChatMessage();
        message.setChatSession(chatSession);
        message.setSender(sender);
        message.setMessageContent(request.getMessageContent());
        message.setMessageType(request.getMessageType());
        message.setStatus(ChatMessage.MessageStatus.SENT);
        message.setSentAt(LocalDateTime.now());
        message.setIsEncrypted(true);
        
        // Handle file attachment if present
        if (request.getFileName() != null) {
            message.setFileName(request.getFileName());
            message.setContentType(request.getContentType());
            message.setFileSize(request.getFileSize());
        }
        
        message = chatMessageRepository.save(message);
        
        // Update chat session
        chatSession.incrementMessageCount();
        chatSessionRepository.save(chatSession);
        
        // Convert to response
        ChatMessageResponse response = convertToMessageResponse(message);
        
        // Send real-time notification via WebSocket
        sendRealTimeMessage(chatSession, response);
        
        log.info("Message sent: ID={}, Session={}, Sender={}", message.getId(), chatSession.getId(), sender.getEmail());
        
        return response;
    }
    
    public List<ChatMessageResponse> getChatMessages(Long chatSessionId, Long userId) {
        // Validate chat session and user access
        ChatSession chatSession = validateChatSessionAccess(chatSessionId, userId);
        
        List<ChatMessage> messages = chatMessageRepository.findByChatSessionIdOrderBySentAtAsc(chatSessionId);
        return messages.stream().map(this::convertToMessageResponse).collect(Collectors.toList());
    }
    
    public Page<ChatMessageResponse> getChatMessagesPage(Long chatSessionId, Long userId, Pageable pageable) {
        // Validate chat session and user access
        validateChatSessionAccess(chatSessionId, userId);
        
        Page<ChatMessage> messages = chatMessageRepository.findByChatSessionIdOrderBySentAtDesc(chatSessionId, pageable);
        return messages.map(this::convertToMessageResponse);
    }
    
    public List<ChatSessionResponse> getUserChatSessions(Long userId) {
        List<ChatSession> sessions = chatSessionRepository.findByParticipantUserId(userId, userId);
        return sessions.stream().map(this::convertToSessionResponse).collect(Collectors.toList());
    }
    
    public ChatSessionResponse getChatSessionByAppointment(Long appointmentId, Long userId) {
        // Validate appointment access
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        
        if (!appointment.getPatient().getId().equals(userId) && 
            !appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this appointment");
        }
        
        ChatSession chatSession = chatSessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found for this appointment"));
        
        return convertToSessionResponse(chatSession);
    }
    
    @Transactional
    public MessageResponse markMessagesAsRead(Long chatSessionId, Long userId) {
        // Validate chat session and user access
        validateChatSessionAccess(chatSessionId, userId);
        
        // Mark all unread messages as read
        chatMessageRepository.markAllMessagesAsRead(chatSessionId, userId, LocalDateTime.now());
        
        log.info("Messages marked as read: Session={}, User={}", chatSessionId, userId);
        
        return MessageResponse.success("Messages marked as read");
    }
    
    @Transactional
    public MessageResponse endChatSession(Long chatSessionId, Long userId) {
        ChatSession chatSession = validateChatSessionAccess(chatSessionId, userId);
        
        if (!chatSession.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat session is already ended");
        }
        
        chatSession.setStatus(ChatSession.ChatStatus.ENDED);
        chatSession.setEndedAt(LocalDateTime.now());
        
        chatSessionRepository.save(chatSession);
        
        // Notify other participant via WebSocket
        String destination = "/topic/chat/" + chatSessionId + "/session-ended";
        messagingTemplate.convertAndSend(destination, "Chat session has been ended");
        
        log.info("Chat session ended: ID={}, User={}", chatSessionId, userId);
        
        return MessageResponse.success("Chat session ended successfully");
    }
    
    public long getUnreadMessageCount(Long chatSessionId, Long userId) {
        validateChatSessionAccess(chatSessionId, userId);
        return chatMessageRepository.countUnreadMessages(chatSessionId, userId);
    }
    
    private ChatSession validateChatSessionAccess(Long chatSessionId, Long userId) {
        ChatSession chatSession = chatSessionRepository.findById(chatSessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));
        
        if (!chatSession.getPatient().getId().equals(userId) && 
            !chatSession.getDoctor().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this chat session");
        }
        
        return chatSession;
    }
    
    private void sendRealTimeMessage(ChatSession chatSession, ChatMessageResponse message) {
        try {
            // Send to specific chat session topic
            String destination = "/topic/chat/" + chatSession.getId();
            messagingTemplate.convertAndSend(destination, message);
            
            // Send to individual users
            String patientDestination = "/user/" + chatSession.getPatient().getId() + "/queue/messages";
            String doctorDestination = "/user/" + chatSession.getDoctor().getUser().getId() + "/queue/messages";
            
            messagingTemplate.convertAndSend(patientDestination, message);
            messagingTemplate.convertAndSend(doctorDestination, message);
            
        } catch (Exception e) {
            log.error("Error sending real-time message: {}", e.getMessage());
        }
    }
    
    private ChatSessionResponse convertToSessionResponse(ChatSession session) {
        ChatSessionResponse response = new ChatSessionResponse();
        response.setId(session.getId());
        response.setAppointmentId(session.getAppointment().getId());
        response.setPatientId(session.getPatient().getId());
        response.setPatientName(session.getPatientName());
        response.setDoctorId(session.getDoctor().getId());
        response.setDoctorName(session.getDoctorName());
        response.setStatus(session.getStatus());
        response.setStartedAt(session.getStartedAt());
        response.setEndedAt(session.getEndedAt());
        response.setLastMessageAt(session.getLastMessageAt());
        response.setTotalMessages(session.getTotalMessages());
        response.setIsEncrypted(session.getIsEncrypted());
        response.setCreatedAt(session.getCreatedAt());
        response.setUpdatedAt(session.getUpdatedAt());
        
        return response;
    }
    
    private ChatMessageResponse convertToMessageResponse(ChatMessage message) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(message.getId());
        response.setChatSessionId(message.getChatSession().getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSenderName());
        response.setSenderRole(message.getSenderRole());
        response.setMessageContent(message.getMessageContent());
        response.setMessageType(message.getMessageType());
        response.setStatus(message.getStatus());
        response.setSentAt(message.getSentAt());
        response.setDeliveredAt(message.getDeliveredAt());
        response.setReadAt(message.getReadAt());
        response.setIsEncrypted(message.getIsEncrypted());
        response.setFileName(message.getFileName());
        response.setFileSize(message.getFileSize());
        response.setContentType(message.getContentType());
        response.setCreatedAt(message.getCreatedAt());

        return response;
    }
}
