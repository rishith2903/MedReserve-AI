package com.medreserve.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ConditionExplainerService {
    
    // Medical condition explanations database
    private static final Map<String, ConditionInfo> CONDITIONS = new HashMap<>();
    
    static {
        // Cardiovascular conditions
        CONDITIONS.put("hypertension", new ConditionInfo(
                "Hypertension (High Blood Pressure)",
                "A condition where blood pressure in the arteries is persistently elevated.",
                "Often called the 'silent killer' because it usually has no symptoms until complications develop.",
                List.of("Headaches", "Shortness of breath", "Nosebleeds", "Chest pain"),
                List.of("Heart disease", "Stroke", "Kidney disease", "Vision problems"),
                List.of("Maintain healthy weight", "Exercise regularly", "Limit sodium intake", "Manage stress", "Take prescribed medications"),
                "Cardiology"
        ));
        
        CONDITIONS.put("diabetes", new ConditionInfo(
                "Diabetes Mellitus",
                "A group of metabolic disorders characterized by high blood sugar levels.",
                "Occurs when the body doesn't produce enough insulin or can't effectively use the insulin it produces.",
                List.of("Frequent urination", "Excessive thirst", "Unexplained weight loss", "Fatigue", "Blurred vision"),
                List.of("Heart disease", "Kidney damage", "Nerve damage", "Eye damage", "Foot problems"),
                List.of("Monitor blood sugar", "Follow diabetic diet", "Exercise regularly", "Take medications as prescribed", "Regular check-ups"),
                "Endocrinology"
        ));
        
        CONDITIONS.put("asthma", new ConditionInfo(
                "Asthma",
                "A respiratory condition where airways narrow and swell, producing extra mucus.",
                "Can make breathing difficult and trigger coughing, wheezing, and shortness of breath.",
                List.of("Shortness of breath", "Chest tightness", "Wheezing", "Coughing", "Difficulty sleeping due to breathing problems"),
                List.of("Severe asthma attacks", "Permanent airway changes", "Respiratory failure"),
                List.of("Avoid triggers", "Use prescribed inhalers", "Monitor symptoms", "Get vaccinated", "Maintain healthy lifestyle"),
                "Pulmonology"
        ));
        
        CONDITIONS.put("arthritis", new ConditionInfo(
                "Arthritis",
                "Inflammation of one or more joints, causing pain and stiffness.",
                "Most common types are osteoarthritis and rheumatoid arthritis, affecting millions worldwide.",
                List.of("Joint pain", "Stiffness", "Swelling", "Reduced range of motion", "Fatigue"),
                List.of("Joint damage", "Disability", "Chronic pain", "Reduced quality of life"),
                List.of("Stay active", "Maintain healthy weight", "Use hot/cold therapy", "Take prescribed medications", "Physical therapy"),
                "Rheumatology"
        ));
        
        CONDITIONS.put("depression", new ConditionInfo(
                "Depression",
                "A mental health disorder characterized by persistent feelings of sadness and loss of interest.",
                "More than just feeling sad, depression affects how you think, feel, and handle daily activities.",
                List.of("Persistent sadness", "Loss of interest", "Fatigue", "Sleep problems", "Difficulty concentrating"),
                List.of("Suicide risk", "Substance abuse", "Relationship problems", "Work/school difficulties"),
                List.of("Seek professional help", "Stay connected with others", "Exercise regularly", "Get enough sleep", "Consider therapy/medication"),
                "Psychiatry"
        ));
        
        CONDITIONS.put("migraine", new ConditionInfo(
                "Migraine",
                "A neurological condition characterized by intense, debilitating headaches.",
                "Often accompanied by nausea, vomiting, and sensitivity to light and sound.",
                List.of("Severe headache", "Nausea", "Vomiting", "Light sensitivity", "Sound sensitivity"),
                List.of("Chronic daily headaches", "Medication overuse headaches", "Status migrainosus"),
                List.of("Identify triggers", "Maintain regular sleep", "Stay hydrated", "Manage stress", "Take preventive medications"),
                "Neurology"
        ));
        
        CONDITIONS.put("eczema", new ConditionInfo(
                "Eczema (Atopic Dermatitis)",
                "A condition that makes skin red, inflamed, and itchy.",
                "Common in children but can occur at any age, often associated with allergies and asthma.",
                List.of("Itchy skin", "Red patches", "Dry skin", "Skin thickening", "Small bumps"),
                List.of("Skin infections", "Sleep problems", "Scarring", "Social/emotional issues"),
                List.of("Moisturize regularly", "Avoid triggers", "Use gentle skincare", "Manage stress", "Follow treatment plan"),
                "Dermatology"
        ));
        
        CONDITIONS.put("gerd", new ConditionInfo(
                "GERD (Gastroesophageal Reflux Disease)",
                "A digestive disorder where stomach acid frequently flows back into the esophagus.",
                "Occurs when the lower esophageal sphincter weakens or relaxes inappropriately.",
                List.of("Heartburn", "Regurgitation", "Chest pain", "Difficulty swallowing", "Chronic cough"),
                List.of("Esophageal damage", "Barrett's esophagus", "Esophageal cancer", "Respiratory problems"),
                List.of("Avoid trigger foods", "Eat smaller meals", "Don't lie down after eating", "Maintain healthy weight", "Take prescribed medications"),
                "Gastroenterology"
        ));
    }
    
    public ConditionInfo explainCondition(String conditionName) {
        String normalizedName = conditionName.toLowerCase().trim();
        
        // Direct match
        ConditionInfo info = CONDITIONS.get(normalizedName);
        if (info != null) {
            return info;
        }
        
        // Fuzzy matching
        for (Map.Entry<String, ConditionInfo> entry : CONDITIONS.entrySet()) {
            if (entry.getKey().contains(normalizedName) || normalizedName.contains(entry.getKey())) {
                return entry.getValue();
            }
            
            // Check if condition name contains the search term
            if (entry.getValue().getName().toLowerCase().contains(normalizedName)) {
                return entry.getValue();
            }
        }
        
        // Return generic response if not found
        return new ConditionInfo(
                "Medical Condition",
                "We don't have specific information about this condition in our database.",
                "Please consult with a healthcare professional for accurate information about your specific condition.",
                List.of("Symptoms vary by condition"),
                List.of("Complications depend on the specific condition"),
                List.of("Follow your doctor's advice", "Take medications as prescribed", "Maintain regular check-ups"),
                "General Medicine"
        );
    }
    
    public List<String> getAvailableConditions() {
        return CONDITIONS.values().stream()
                .map(ConditionInfo::getName)
                .sorted()
                .toList();
    }
    
    public List<ConditionInfo> searchConditions(String searchTerm) {
        String normalizedSearch = searchTerm.toLowerCase().trim();
        
        return CONDITIONS.values().stream()
                .filter(condition -> 
                        condition.getName().toLowerCase().contains(normalizedSearch) ||
                        condition.getDescription().toLowerCase().contains(normalizedSearch) ||
                        condition.getSymptoms().stream().anyMatch(symptom -> 
                                symptom.toLowerCase().contains(normalizedSearch))
                )
                .toList();
    }
    
    public static class ConditionInfo {
        private final String name;
        private final String description;
        private final String explanation;
        private final List<String> symptoms;
        private final List<String> complications;
        private final List<String> management;
        private final String recommendedSpecialty;
        
        public ConditionInfo(String name, String description, String explanation, 
                           List<String> symptoms, List<String> complications, 
                           List<String> management, String recommendedSpecialty) {
            this.name = name;
            this.description = description;
            this.explanation = explanation;
            this.symptoms = symptoms;
            this.complications = complications;
            this.management = management;
            this.recommendedSpecialty = recommendedSpecialty;
        }
        
        // Getters
        public String getName() { return name; }
        public String getDescription() { return description; }
        public String getExplanation() { return explanation; }
        public List<String> getSymptoms() { return symptoms; }
        public List<String> getComplications() { return complications; }
        public List<String> getManagement() { return management; }
        public String getRecommendedSpecialty() { return recommendedSpecialty; }
    }
}
