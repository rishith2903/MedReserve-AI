package com.medreserve.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class RateLimitService {

    private final int uploadsPerMinute;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitService(@Value("${app.security.ratelimit.uploads.requests-per-minute:10}") int uploadsPerMinute) {
        this.uploadsPerMinute = uploadsPerMinute;
    }

    private Bucket newUploadBucket() {
        Bandwidth limit = Bandwidth.classic(uploadsPerMinute, Refill.intervally(uploadsPerMinute, Duration.ofMinutes(1)));
        return Bucket4j.builder().addLimit(limit).build();
    }

    private Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, k -> newUploadBucket());
    }

    public void checkUploadAllowed(String key) {
        Bucket bucket = resolveBucket(key);
        if (!bucket.tryConsume(1)) {
            log.warn("Upload rate limit exceeded for key={} (limit={} requests/min)", key, uploadsPerMinute);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Upload rate limit exceeded. Please try again in a minute.");
        }
    }
}
