package com.medreserve.controller;

import com.medreserve.dto.ChatRequest;
import com.medreserve.dto.ChatResponse;
import com.medreserve.entity.User;
import com.medreserve.service.ChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "AI-powered chatbot APIs")
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;

    @Value("${chatbot.supported-languages:en,hi,te}")
    private List<String> supportedLanguages;

    @Value("${chatbot.default-language:en}")
    private String defaultLanguage;
    
    @PostMapping("/chat")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Chat with AI assistant", description = "Send a message to the AI chatbot and get a response")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        
        // Extract JWT token from request
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        ChatResponse response = chatbotService.processMessage(request, jwtToken);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/intents")
    @Operation(summary = "Get available intents", description = "Get list of available chatbot intents and their descriptions")
    public ResponseEntity<Map<String, Object>> getAvailableIntents(
            HttpServletRequest httpRequest) {
        
        // Extract JWT token from request
        String authHeader = httpRequest.getHeader("Authorization");
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        
        Map<String, Object> intents = chatbotService.getAvailableIntents(jwtToken);
        return ResponseEntity.ok(intents);
    }
    
    @GetMapping("/health")
    @Operation(summary = "Chatbot service health", description = "Check chatbot service health status")
    public ResponseEntity<Map<String, Object>> getChatbotServiceHealth() {
        boolean isHealthy = chatbotService.isChatbotServiceHealthy();

        Map<String, Object> response = Map.of(
                "chatbot_service_healthy", isHealthy,
                "status", isHealthy ? "UP" : "DOWN",
                "timestamp", java.time.LocalDateTime.now()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Dialogflow Webhook Endpoint
     * Handles multilingual webhook requests from Dialogflow CX/ES agents
     */
    @PostMapping("/webhook")
    @Operation(summary = "Dialogflow webhook", description = "Webhook endpoint for Dialogflow CX/ES agents with multilingual support")
    public ResponseEntity<Map<String, Object>> handleDialogflowWebhook(@RequestBody Map<String, Object> request) {
        try {
            log.info("📥 Incoming Dialogflow webhook request");

            // Extract queryResult from Dialogflow request
            Map<String, Object> queryResult = (Map<String, Object>) request.get("queryResult");
            if (queryResult == null) {
                log.warn("⚠️ No queryResult found in request");
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid request format"));
            }

            // Extract language code
            String languageCode = (String) queryResult.get("languageCode");
            if (languageCode == null || languageCode.isEmpty()) {
                languageCode = defaultLanguage;
            }

            // Normalize language code (remove region if present, e.g., "en-US" -> "en")
            languageCode = languageCode.split("-")[0].toLowerCase();

            // Validate supported language
            if (!supportedLanguages.contains(languageCode)) {
                log.warn("⚠️ Unsupported language: {}, using default: {}", languageCode, defaultLanguage);
                languageCode = defaultLanguage;
            }

            // Extract intent information
            Map<String, Object> intent = (Map<String, Object>) queryResult.get("intent");
            String intentName = "Default";
            if (intent != null) {
                intentName = (String) intent.get("displayName");
            }

            if (intentName == null || intentName.isEmpty()) {
                intentName = "Default";
            }

            log.info("🎯 Processing intent: {} in language: {}", intentName, languageCode);

            // Generate localized response
            String fulfillmentText = generateMultilingualResponse(intentName, languageCode);

            // Create Dialogflow response
            Map<String, Object> response = new HashMap<>();
            response.put("fulfillmentText", fulfillmentText);

            log.info("📤 Sending response: {}", fulfillmentText);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error processing Dialogflow webhook request", e);
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Test endpoint for Dialogflow webhook
     */
    @PostMapping("/webhook/test")
    @Operation(summary = "Test Dialogflow webhook", description = "Test endpoint for manual testing of multilingual responses")
    public ResponseEntity<Map<String, Object>> testDialogflowWebhook(
            @RequestParam String intent,
            @RequestParam(defaultValue = "en") String language) {

        String response = generateMultilingualResponse(intent, language);
        Map<String, Object> result = new HashMap<>();
        result.put("intent", intent);
        result.put("language", language);
        result.put("fulfillmentText", response);
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * Generate localized response based on intent and language
     */
    private String generateMultilingualResponse(String intentName, String languageCode) {
        return switch (intentName.toLowerCase()) {
            case "bookappointment", "book.appointment", "appointment.book" ->
                getBookingResponse(languageCode);
            case "cancelappointment", "cancel.appointment", "appointment.cancel" ->
                getCancelResponse(languageCode);
            case "listmedicines", "list.medicines", "medicines.list", "medicine.info" ->
                getMedicineResponse(languageCode);
            case "conditionexplainer", "condition.explainer", "health.condition", "disease.info" ->
                getConditionResponse(languageCode);
            case "faq", "help", "support" ->
                getFaqResponse(languageCode);
            default ->
                getDefaultResponse(languageCode);
        };
    }

    /**
     * Booking appointment responses
     */
    private String getBookingResponse(String lang) {
        return switch (lang) {
            case "hi" -> "आपकी अपॉइंटमेंट बुक हो गई है! डॉक्टर आपसे जल्द ही मिलेंगे। क्या आपको कोई और सहायता चाहिए?";
            case "te" -> "మీ అపాయింట్మెంట్ బుకైంది! డాక్టర్ త్వరలో మిమ్మల్ని కలుస్తారు. మీకు ఇంకా ఏదైనా సహాయం కావాలా?";
            default -> "Your appointment has been booked successfully! The doctor will see you soon. Is there anything else I can help you with?";
        };
    }

    /**
     * Cancel appointment responses
     */
    private String getCancelResponse(String lang) {
        return switch (lang) {
            case "hi" -> "आपकी अपॉइंटमेंट रद्द कर दी गई है। यदि आपको दोबारा अपॉइंटमेंट बुक करनी हो तो कृपया बताएं।";
            case "te" -> "మీ అపాయింట్మెంట్ రద్దు చేయబడింది. మీకు మళ్లీ అపాయింట్మెంట్ బుక్ చేయాలంటే దయచేసి చెప్పండి.";
            default -> "Your appointment has been cancelled successfully. Please let me know if you'd like to book another appointment.";
        };
    }

    /**
     * Medicine information responses
     */
    private String getMedicineResponse(String lang) {
        return switch (lang) {
            case "hi" -> "दवा की जानकारी के लिए कृपया डॉक्टर से परामर्श करें। मैं आपको डॉक्टर से अपॉइंटमेंट बुक करने में मदद कर सकता हूं।";
            case "te" -> "మందుల కోసం దయచేసి డాక్టర్‌ను సంప్రదించండి. నేను మీకు డాక్టర్‌తో అపాయింట్మెంట్ బుక్ చేయడంలో సహాయం చేయగలను.";
            default -> "For medicine information, please consult with a doctor. I can help you book an appointment with a specialist.";
        };
    }

    /**
     * Medical condition explanation responses
     */
    private String getConditionResponse(String lang) {
        return switch (lang) {
            case "hi" -> "अस्थमा एक ऐसी स्थिति है जो सांस लेने को प्रभावित करती है। सटीक जानकारी के लिए कृपया डॉक्टर से मिलें।";
            case "te" -> "ఆస్థమా అనేది శ్వాసపై ప్రభావం చూపించే పరిస్థితి. ఖచ్చితమైన సమాచారం కోసం దయచేసి డాక్టర్‌ను కలవండి.";
            default -> "Asthma is a condition that affects breathing and airways. For accurate information about your specific condition, please consult with a doctor.";
        };
    }

    /**
     * FAQ and help responses
     */
    private String getFaqResponse(String lang) {
        return switch (lang) {
            case "hi" -> "आप 'अपॉइंटमेंट रद्द करें' कहकर अपॉइंटमेंट रद्द कर सकते हैं। अन्य सहायता के लिए 'मदद' कहें।";
            case "te" -> "మీరు 'అపాయింట్మెంట్ రద్దు చేయండి' అని చెప్పి అపాయింట్మెంట్ రద్దు చేయవచ్చు. ఇతర సహాయం కోసం 'సహాయం' అని చెప్పండి.";
            default -> "You can cancel appointments by saying 'Cancel appointment'. For other help, just say 'help' or ask me anything about MedReserve services.";
        };
    }

    /**
     * Default response for unrecognized intents
     */
    private String getDefaultResponse(String lang) {
        return switch (lang) {
            case "hi" -> "मुझे खुशी होगी आपकी मदद करने में! मैं अपॉइंटमेंट बुकिंग, रद्दीकरण, और स्वास्थ्य जानकारी में सहायता कर सकता हूं।";
            case "te" -> "మీకు సహాయం చేయడంలో నేను సంతోషిస్తాను! నేను అపాయింట్మెంట్ బుకింగ్, రద్దు మరియు ఆరోగ్య సమాచారంలో సహాయం చేయగలను.";
            default -> "I'm here to help you with MedReserve services! I can assist with appointment booking, cancellations, and general health information.";
        };
    }

    /**
     * Create error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("fulfillmentText", "Sorry, I encountered an error. Please try again.");
        error.put("error", message);
        return error;
    }
}
