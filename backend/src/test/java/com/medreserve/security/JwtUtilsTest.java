package com.medreserve.security;

import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {
    
    private JwtUtils jwtUtils;
    private User testUser;
    private Authentication authentication;
    
    @BeforeEach
    void setUp() {
        String secret = "mySecretKey123456789012345678901234567890"; // >=32 bytes
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        jwtUtils = new JwtUtils(key);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000);
        ReflectionTestUtils.setField(jwtUtils, "jwtRefreshExpirationMs", 604800000);
        
        // Create test user
        Role role = new Role();
        role.setName(Role.RoleName.PATIENT);
        
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(role);
        testUser.setIsActive(true);
        testUser.setEmailVerified(true);
        
        authentication = new UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities());
    }
    
    @Test
    void testGenerateJwtToken() {
        String token = jwtUtils.generateJwtToken(authentication);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }
    
    @Test
    void testGenerateRefreshToken() {
        String refreshToken = jwtUtils.generateRefreshToken(authentication);
        
        assertNotNull(refreshToken);
        assertFalse(refreshToken.isEmpty());
        assertTrue(refreshToken.split("\\.").length == 3);
    }
    
    @Test
    void testGetUserNameFromJwtToken() {
        String token = jwtUtils.generateJwtToken(authentication);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        
        assertEquals("test@example.com", username);
    }
    
    @Test
    void testValidateJwtToken() {
        String token = jwtUtils.generateJwtToken(authentication);
        
        assertTrue(jwtUtils.validateJwtToken(token));
    }
    
    @Test
    void testValidateInvalidJwtToken() {
        String invalidToken = "invalid.token.here";
        
        assertFalse(jwtUtils.validateJwtToken(invalidToken));
    }
    
    @Test
    void testIsTokenExpired() {
        String token = jwtUtils.generateJwtToken(authentication);
        
        assertFalse(jwtUtils.isTokenExpired(token));
    }
    
    @Test
    void testGetExpirationDateFromToken() {
        String token = jwtUtils.generateJwtToken(authentication);
        
        assertNotNull(jwtUtils.getExpirationDateFromToken(token));
        assertTrue(jwtUtils.getExpirationDateFromToken(token).getTime() > System.currentTimeMillis());
    }
}
