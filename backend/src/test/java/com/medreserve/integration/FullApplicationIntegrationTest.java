package com.medreserve.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medreserve.dto.LoginRequest;
import com.medreserve.dto.SignupRequest;
import com.medreserve.entity.User;

import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Full Application Integration Tests")
class FullApplicationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should test complete authentication flow")
    void testCompleteAuthFlow() throws Exception {
        // Test signup
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("integration@test.com");
        signupRequest.setPassword("Password123!");
        signupRequest.setFirstName("Integration");
        signupRequest.setLastName("Test");
        signupRequest.setPhoneNumber("+1987654321");
        signupRequest.setDateOfBirth(LocalDate.of(1990, 1, 1));
        signupRequest.setGender(User.Gender.MALE);

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Test login with the same credentials
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("integration@test.com");
        loginRequest.setPassword("Password123!");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.type").value("Bearer"));
    }

    @Test
    @DisplayName("Should test public endpoints accessibility")
    void testPublicEndpoints() throws Exception {
        // Test health endpoint
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());

        // Test doctor specialties endpoint
        mockMvc.perform(get("/doctors/specialties"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Test doctors endpoint
        mockMvc.perform(get("/doctors"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Should test protected endpoints security")
    void testProtectedEndpoints() throws Exception {
        // Test that protected endpoints require authentication
        mockMvc.perform(get("/appointments/patient/my-appointments"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should test CORS configuration")
    void testCorsConfiguration() throws Exception {
        mockMvc.perform(get("/doctors/specialties")
                .header("Origin", "https://med-reserve-ai.vercel.app"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }

    @Test
    @DisplayName("Should test error handling")
    void testErrorHandling() throws Exception {
        // Test 404 for non-existent endpoint
        mockMvc.perform(get("/non-existent-endpoint"))
                .andExpect(status().isNotFound());

        // Test validation errors
        SignupRequest invalidRequest = new SignupRequest();
        invalidRequest.setEmail("invalid-email");

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should test database operations")
    void testDatabaseOperations() throws Exception {
        // Test that data initialization worked
        mockMvc.perform(get("/doctors/specialties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThan(0)));
    }

    @Test
    @DisplayName("Should test pagination")
    void testPagination() throws Exception {
        mockMvc.perform(get("/doctors")
                .param("page", "0")
                .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.pageable").exists())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    @DisplayName("Should test search functionality")
    void testSearchFunctionality() throws Exception {
        mockMvc.perform(get("/doctors/search")
                .param("keyword", "cardio"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
