package com.medreserve.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {

    @PostMapping("/analyze-symptoms")
    public ResponseEntity<Map<String, Object>> analyzeSymptoms(@RequestBody Map<String, Object> request) {
        try {
            Object symptomsObj = request.get("symptoms");
            if (symptomsObj == null || symptomsObj.toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Symptoms are required"
                ));
            }

            String symptoms = symptomsObj.toString().trim();
            Map<String, Object> analysis = analyzeSymptomsLogic(symptoms);
            return ResponseEntity.ok(analysis);

        } catch (Exception e) {
            log.error("Error in /ai/analyze-symptoms", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal server error",
                "message", e.getMessage()
            ));
        }
    }

    private Map<String, Object> analyzeSymptomsLogic(String symptoms) {
        String lower = symptoms.toLowerCase(Locale.ROOT);

        List<Map<String, Object>> conditions = new ArrayList<>();
        if ((lower.contains("fever") || lower.contains("temperature")) &&
            (lower.contains("cough") || lower.contains("throat"))) {
            conditions.add(Map.of(
                "name", "Upper Respiratory Infection",
                "probability", "High",
                "description", "Common infection affecting nose, throat, and airways."
            ));
            conditions.add(Map.of(
                "name", "Influenza",
                "probability", "Medium",
                "description", "Viral infection with fever, aches, fatigue, and respiratory symptoms."
            ));
        }
        if (lower.contains("headache")) {
            conditions.add(Map.of(
                "name", "Tension Headache",
                "probability", "Medium",
                "description", "Often caused by stress, muscle tension, or posture."
            ));
            if (lower.contains("nausea") || lower.contains("light")) {
                conditions.add(Map.of(
                    "name", "Migraine",
                    "probability", "Medium",
                    "description", "Moderate to severe headaches with sensitivity to light/sound."
                ));
            }
        }
        if (lower.contains("stomach") || lower.contains("abdominal")) {
            conditions.add(Map.of(
                "name", "Gastroenteritis",
                "probability", "Medium",
                "description", "Inflammation of stomach and intestines causing pain, nausea, diarrhea."
            ));
        }
        if (lower.contains("chest pain") || lower.contains("chest pressure")) {
            conditions.add(Map.of(
                "name", "Cardiac Event (Requires Immediate Evaluation)",
                "probability", "Unknown - Urgent Evaluation Needed",
                "description", "Chest pain can indicate serious cardiac conditions. Immediate evaluation is essential."
            ));
        }
        if (conditions.isEmpty()) {
            conditions.add(Map.of(
                "name", "General Malaise",
                "probability", "Medium",
                "description", "Non-specific symptoms with various possible causes."
            ));
            conditions.add(Map.of(
                "name", "Viral Infection",
                "probability", "Low to Medium",
                "description", "General symptoms may reflect common viral illness."
            ));
        }
        if (conditions.size() > 4) {
            conditions = conditions.subList(0, 4);
        }

        List<String> recommendations = new ArrayList<>();
        recommendations.add("Consult with a healthcare professional for proper diagnosis and treatment plan");
        if (lower.contains("fever")) {
            recommendations.add("Monitor temperature and stay hydrated");
            recommendations.add("Rest adequately");
        }
        if (lower.contains("pain")) {
            recommendations.add("Track pain intensity, location, and triggers");
            recommendations.add("Consider OTC pain relief as appropriate (consult pharmacist)");
        }
        if (lower.contains("cough") || lower.contains("throat")) {
            recommendations.add("Stay hydrated; warm liquids can soothe throat irritation");
            recommendations.add("Avoid irritants like smoke and strong odors");
        }
        recommendations.add("Document symptoms, onset, and changes in severity");
        recommendations.add("Seek immediate care if symptoms worsen or new concerning symptoms develop");
        if (recommendations.size() > 5) {
            recommendations = recommendations.subList(0, 5);
        }

        String urgency;
        List<String> emergencyKeywords = Arrays.asList(
            "chest pain", "difficulty breathing", "can't breathe", "severe bleeding",
            "unconscious", "seizure", "stroke", "heart attack", "severe head injury",
            "severe abdominal pain", "coughing blood", "suicidal"
        );
        if (emergencyKeywords.stream().anyMatch(lower::contains)) {
            urgency = "Emergency - Seek immediate medical attention or call emergency services";
        } else {
            List<String> urgentKeywords = Arrays.asList(
                "high fever", "persistent vomiting", "severe pain", "confusion",
                "persistent diarrhea", "dehydration", "spreading rash"
            );
            if (urgentKeywords.stream().anyMatch(lower::contains)) {
                urgency = "Urgent - Consult healthcare provider within 24 hours";
            } else {
                int symptomCount = (int) lower.chars().filter(ch -> ch == ',').count() + (lower.contains("and") ? 1 : 0) + 1;
                urgency = symptomCount > 3
                    ? "Routine - Schedule appointment with healthcare provider soon"
                    : "Monitor - Track symptoms and consult healthcare provider if worsening or persistent";
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("conditions", conditions);
        result.put("recommendations", recommendations);
        result.put("urgencyLevel", urgency);
        result.put("disclaimer", "This analysis is for educational purposes only and not a substitute for professional medical advice. Seek professional care as needed.");
        return result;
    }
}
