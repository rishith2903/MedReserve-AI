package com.medreserve.service;

import com.medreserve.dto.ChatRequest;
import com.medreserve.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {
    
    private final RestTemplate restTemplate;
    
    @Value("${chatbot.service.url:http://localhost:5005}")
    private String chatbotServiceUrl;
    
    @Retry(name = "chatbotService")
    @CircuitBreaker(name = "chatbotService")
    public ChatResponse processMessage(ChatRequest request, String jwtToken) {
        try {
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(jwtToken);
            
            HttpEntity<ChatRequest> entity = new HttpEntity<>(request, headers);
            
            // Make request to chatbot service
            ResponseEntity<ChatResponse> response = restTemplate.exchange(
                    chatbotServiceUrl + "/chat",
                    HttpMethod.POST,
                    entity,
                    ChatResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Chatbot processed message: intent={}", response.getBody().getIntent());
                return response.getBody();
            } else {
                throw new RuntimeException("Chatbot service returned unexpected response");
            }
            
        } catch (Exception e) {
            log.error("Error calling chatbot service: {}", e.getMessage());
            
            // Return fallback response
            return createFallbackResponse(request.getMessage());
        }
    }
    
    @Cacheable(cacheNames = "chatbotIntents", key = "'intents'")
    public Map<String, Object> getAvailableIntents(String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(jwtToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    chatbotServiceUrl + "/intents",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
            
        } catch (Exception e) {
            log.error("Error getting intents from chatbot service: {}", e.getMessage());
        }
        
        // Return default intents
        return getDefaultIntents();
    }
    
    @Cacheable(cacheNames = "serviceHealth", key = "'chatbot'")
    public boolean isChatbotServiceHealthy() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    chatbotServiceUrl + "/health",
                    Map.class
            );
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.warn("Chatbot service health check failed: {}", e.getMessage());
            return false;
        }
    }
    
    private ChatResponse createFallbackResponse(String message) {
        ChatResponse response = new ChatResponse();
        
        // Simple keyword-based fallback logic
        String intent = determineFallbackIntent(message.toLowerCase());
        String responseText = getFallbackResponseText(intent);
        
        response.setResponse(responseText);
        response.setIntent(intent);
        response.setConfidence(0.5);
        response.setSuggestions(List.of(
                "Book appointment",
                "Find doctor", 
                "View appointments",
                "Get help"
        ));
        response.setTimestamp(LocalDateTime.now());
        
        return response;
    }
    
    private String determineFallbackIntent(String message) {
        if (message.contains("book") || message.contains("appointment") || message.contains("schedule")) {
            return "book_appointment";
        } else if (message.contains("doctor") || message.contains("find") || message.contains("specialist")) {
            return "find_doctor";
        } else if (message.contains("view") || message.contains("my") || message.contains("appointments")) {
            return "view_appointments";
        } else if (message.contains("cancel") || message.contains("remove")) {
            return "cancel_appointment";
        } else if (message.contains("hello") || message.contains("hi") || message.contains("help")) {
            return "greeting";
        } else if (message.contains("symptoms") || message.contains("pain") || message.contains("sick")) {
            return "symptoms";
        } else {
            return "unknown";
        }
    }
    
    private String getFallbackResponseText(String intent) {
        return switch (intent) {
            case "book_appointment" -> "I can help you book an appointment! Please use the appointment booking feature in the app.";
            case "find_doctor" -> "I can help you find a doctor. Please use the doctor search feature to find specialists.";
            case "view_appointments" -> "You can view your appointments in the 'My Appointments' section of the app.";
            case "cancel_appointment" -> "To cancel an appointment, please go to your appointments list and select the appointment to cancel.";
            case "greeting" -> "Hello! I'm your MedReserve AI assistant. How can I help you today?";
            case "symptoms" -> "For symptom analysis, I recommend using our AI-powered specialty prediction tool or consulting with a healthcare professional.";
            default -> "I'm here to help with your medical appointments and health-related questions. How can I assist you?";
        };
    }
    
    private Map<String, Object> getDefaultIntents() {
        return Map.of(
                "intents", Map.of(
                        "greeting", Map.of(
                                "description", "Handle greeting and welcome messages",
                                "suggestions", List.of("Hello", "Hi", "Help me")
                        ),
                        "book_appointment", Map.of(
                                "description", "Handle appointment booking requests",
                                "suggestions", List.of("Book appointment", "Schedule visit", "See doctor")
                        ),
                        "find_doctor", Map.of(
                                "description", "Handle doctor search requests",
                                "suggestions", List.of("Find doctor", "Search specialist", "Recommend doctor")
                        ),
                        "view_appointments", Map.of(
                                "description", "Handle appointment viewing requests",
                                "suggestions", List.of("My appointments", "View schedule", "Upcoming visits")
                        )
                )
        );
    }
}
