package com.medreserve.controller;

import com.medreserve.dto.ChatMessageRequest;
import com.medreserve.dto.ChatMessageResponse;
import com.medreserve.dto.ChatSessionResponse;
import com.medreserve.dto.MessageResponse;
import com.medreserve.entity.User;
import com.medreserve.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Real-time chat APIs")
public class ChatController {
    
    private final ChatService chatService;
    
    // REST endpoints
    @PostMapping("/chat/sessions")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Create chat session", description = "Create a new chat session for an appointment")
    @ResponseBody
    public ResponseEntity<ChatSessionResponse> createChatSession(
            @RequestParam Long appointmentId,
            @AuthenticationPrincipal User currentUser) {
        ChatSessionResponse response = chatService.createChatSession(appointmentId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/chat/sessions")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get user chat sessions", description = "Get all chat sessions for the current user")
    @ResponseBody
    public ResponseEntity<List<ChatSessionResponse>> getUserChatSessions(@AuthenticationPrincipal User currentUser) {
        List<ChatSessionResponse> sessions = chatService.getUserChatSessions(currentUser.getId());
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/chat/sessions/appointment/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get chat session by appointment", description = "Get chat session for a specific appointment")
    @ResponseBody
    public ResponseEntity<ChatSessionResponse> getChatSessionByAppointment(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal User currentUser) {
        ChatSessionResponse session = chatService.getChatSessionByAppointment(appointmentId, currentUser.getId());
        return ResponseEntity.ok(session);
    }
    
    @GetMapping("/chat/sessions/{sessionId}/messages")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get chat messages", description = "Get all messages for a chat session")
    @ResponseBody
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User currentUser) {
        List<ChatMessageResponse> messages = chatService.getChatMessages(sessionId, currentUser.getId());
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/chat/sessions/{sessionId}/messages/page")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get chat messages with pagination", description = "Get paginated messages for a chat session")
    @ResponseBody
    public ResponseEntity<Page<ChatMessageResponse>> getChatMessagesPage(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User currentUser,
            Pageable pageable) {
        Page<ChatMessageResponse> messages = chatService.getChatMessagesPage(sessionId, currentUser.getId(), pageable);
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping("/chat/messages")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Send message", description = "Send a message in a chat session")
    @ResponseBody
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal User currentUser) {
        ChatMessageResponse response = chatService.sendMessage(request, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/chat/sessions/{sessionId}/mark-read")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Mark messages as read", description = "Mark all unread messages as read")
    @ResponseBody
    public ResponseEntity<MessageResponse> markMessagesAsRead(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User currentUser) {
        MessageResponse response = chatService.markMessagesAsRead(sessionId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/chat/sessions/{sessionId}/end")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "End chat session", description = "End an active chat session")
    @ResponseBody
    public ResponseEntity<MessageResponse> endChatSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User currentUser) {
        MessageResponse response = chatService.endChatSession(sessionId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/chat/sessions/{sessionId}/unread-count")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get unread message count", description = "Get count of unread messages")
    @ResponseBody
    public ResponseEntity<Long> getUnreadMessageCount(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User currentUser) {
        long count = chatService.getUnreadMessageCount(sessionId, currentUser.getId());
        return ResponseEntity.ok(count);
    }
    
    // WebSocket endpoints
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest message, Principal principal) {
        // Get user from principal
        User user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) principal).getPrincipal();
        chatService.sendMessage(message, user.getId());
    }
    
    @MessageMapping("/chat.markRead")
    public void markMessagesAsRead(@Payload Long sessionId, Principal principal) {
        User user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) principal).getPrincipal();
        chatService.markMessagesAsRead(sessionId, user.getId());
    }
}
