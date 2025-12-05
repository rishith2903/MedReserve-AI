package com.medreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ChatResponse {
    
    private String response;
    private String intent;
    private Double confidence;
    private List<String> suggestions;
    private List<Map<String, Object>> actions;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
}
