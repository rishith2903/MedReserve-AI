package com.medreserve.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitingConfig {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    // Different rate limits for different endpoints
    private static final int GENERAL_REQUESTS_PER_MINUTE = 60;
    private static final int ML_REQUESTS_PER_MINUTE = 10;
    private static final int CHAT_REQUESTS_PER_MINUTE = 30;
    private static final int FILE_UPLOAD_REQUESTS_PER_MINUTE = 5;
    private static final int LOGIN_REQUESTS_PER_MINUTE = 10; // brute-force protection
    
    public Bucket createNewBucket(RateLimitType type) {
        return switch (type) {
            case GENERAL -> Bucket.builder()
                    .addLimit(Bandwidth.classic(GENERAL_REQUESTS_PER_MINUTE, Refill.intervally(GENERAL_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))))
                    .build();
            case ML_PREDICTION -> Bucket.builder()
                    .addLimit(Bandwidth.classic(ML_REQUESTS_PER_MINUTE, Refill.intervally(ML_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))))
                    .build();
            case CHAT -> Bucket.builder()
                    .addLimit(Bandwidth.classic(CHAT_REQUESTS_PER_MINUTE, Refill.intervally(CHAT_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))))
                    .build();
            case FILE_UPLOAD -> Bucket.builder()
                    .addLimit(Bandwidth.classic(FILE_UPLOAD_REQUESTS_PER_MINUTE, Refill.intervally(FILE_UPLOAD_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))))
                    .build();
            case LOGIN -> Bucket.builder()
                    .addLimit(Bandwidth.classic(LOGIN_REQUESTS_PER_MINUTE, Refill.intervally(LOGIN_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))))
                    .build();
        };
    }
    
    public Bucket resolveBucket(String key, RateLimitType type) {
        return cache.computeIfAbsent(key + "_" + type.name(), k -> createNewBucket(type));
    }
    
    public boolean tryConsume(String userKey, RateLimitType type) {
        return resolveBucket(userKey, type).tryConsume(1);
    }
    
    public enum RateLimitType {
        GENERAL,
        ML_PREDICTION,
        CHAT,
        FILE_UPLOAD,
        LOGIN
    }
}
