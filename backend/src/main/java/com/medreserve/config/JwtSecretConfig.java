package com.medreserve.config;

import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtSecretConfig {

    @Value("${security.jwt.secret:}")
    private String jwtSecret;

    @PostConstruct
    public void validate() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret missing. Set JWT_SECRET with a strong value (>= 32 bytes). Suggested: openssl rand -base64 48");
        }
        int byteLen = jwtSecret.getBytes(StandardCharsets.UTF_8).length;
        if (byteLen < 32) {
            throw new IllegalStateException("JWT secret too short (" + byteLen + " bytes). Minimum is 32 bytes for HS256. Suggested: openssl rand -base64 48");
        }
    }

    @Bean
    public SecretKey jwtSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
    }
}
