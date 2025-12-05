package com.medreserve.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class LoginAttemptService {

    private final int maxAttempts;
    private final long lockoutMs;

    private static class Entry {
        int attempts;
        long lockUntil;
    }

    private final Map<String, Entry> cache = new ConcurrentHashMap<>();

    public LoginAttemptService(
            @Value("${app.security.login.max-attempts:5}") int maxAttempts,
            @Value("${app.security.login.lockout-ms:900000}") long lockoutMs
    ) {
        this.maxAttempts = maxAttempts;
        this.lockoutMs = lockoutMs;
    }

    public boolean isLocked(String key) {
        Entry e = cache.get(key.toLowerCase());
        if (e == null) return false;
        if (e.lockUntil > Instant.now().toEpochMilli()) return true;
        // lock expired
        return false;
    }

    public void loginSucceeded(String key) {
        cache.remove(key.toLowerCase());
    }

    public void loginFailed(String key) {
        String k = key.toLowerCase();
        Entry e = cache.computeIfAbsent(k, kk -> new Entry());
        e.attempts++;
        if (e.attempts >= maxAttempts) {
            e.lockUntil = Instant.now().toEpochMilli() + lockoutMs;
            log.warn("Account temporarily locked: key={} attempts={} lockoutMs={}", k, e.attempts, lockoutMs);
        }
    }
}