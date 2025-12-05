package com.medreserve.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/health-tips")
@RequiredArgsConstructor
@Tag(name = "Health Tips", description = "Health tips and wellness advice")
public class HealthTipsController {

    @GetMapping
    @Operation(summary = "Get health tips", description = "Retrieve a list of health tips and wellness advice")
    public ResponseEntity<List<Map<String, Object>>> getHealthTips() {
        List<Map<String, Object>> healthTips = Arrays.asList(
            Map.of(
                "id", 1,
                "title", "Stay Hydrated",
                "description", "Drink at least 8 glasses of water daily to maintain proper hydration and support bodily functions.",
                "category", "Nutrition",
                "icon", "💧"
            ),
            Map.of(
                "id", 2,
                "title", "Regular Exercise",
                "description", "Engage in at least 30 minutes of moderate physical activity most days of the week.",
                "category", "Fitness",
                "icon", "🏃‍♂️"
            ),
            Map.of(
                "id", 3,
                "title", "Balanced Diet",
                "description", "Include a variety of fruits, vegetables, whole grains, and lean proteins in your daily meals.",
                "category", "Nutrition",
                "icon", "🥗"
            ),
            Map.of(
                "id", 4,
                "title", "Quality Sleep",
                "description", "Aim for 7-9 hours of quality sleep each night to support physical and mental health.",
                "category", "Sleep",
                "icon", "😴"
            ),
            Map.of(
                "id", 5,
                "title", "Stress Management",
                "description", "Practice relaxation techniques like meditation, deep breathing, or yoga to manage stress.",
                "category", "Mental Health",
                "icon", "🧘‍♀️"
            ),
            Map.of(
                "id", 6,
                "title", "Regular Check-ups",
                "description", "Schedule regular health screenings and check-ups with your healthcare provider.",
                "category", "Prevention",
                "icon", "🩺"
            ),
            Map.of(
                "id", 7,
                "title", "Hand Hygiene",
                "description", "Wash your hands frequently with soap and water for at least 20 seconds.",
                "category", "Hygiene",
                "icon", "🧼"
            ),
            Map.of(
                "id", 8,
                "title", "Limit Screen Time",
                "description", "Take regular breaks from screens and practice the 20-20-20 rule for eye health.",
                "category", "Digital Wellness",
                "icon", "📱"
            ),
            Map.of(
                "id", 9,
                "title", "Social Connections",
                "description", "Maintain healthy relationships and social connections for better mental well-being.",
                "category", "Mental Health",
                "icon", "👥"
            ),
            Map.of(
                "id", 10,
                "title", "Sun Protection",
                "description", "Use sunscreen with SPF 30+ and wear protective clothing when outdoors.",
                "category", "Skin Health",
                "icon", "☀️"
            )
        );
        
        return ResponseEntity.ok(healthTips);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get health tips by category", description = "Retrieve health tips filtered by category")
    public ResponseEntity<List<Map<String, Object>>> getHealthTipsByCategory(@PathVariable String category) {
        // This would normally filter from database, but for now return all tips
        return getHealthTips();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get health tip by ID", description = "Retrieve a specific health tip by its ID")
    public ResponseEntity<Map<String, Object>> getHealthTipById(@PathVariable Long id) {
        Map<String, Object> healthTip = Map.of(
            "id", id,
            "title", "Stay Hydrated",
            "description", "Drink at least 8 glasses of water daily to maintain proper hydration and support bodily functions.",
            "category", "Nutrition",
            "icon", "💧",
            "detailedContent", "Proper hydration is essential for maintaining optimal health. Water helps regulate body temperature, transport nutrients, remove waste products, and maintain blood pressure. Signs of dehydration include fatigue, headache, and dark urine. Make sure to increase water intake during exercise or hot weather."
        );
        
        return ResponseEntity.ok(healthTip);
    }
}
