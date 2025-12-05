package com.medreserve.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medreserve.dto.LoginRequest;
import com.medreserve.dto.SignupRequest;
import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.repository.RoleRepository;
import com.medreserve.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private Role patientRole;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Create patient role if it doesn't exist
        patientRole = roleRepository.findByName(Role.RoleName.PATIENT)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(Role.RoleName.PATIENT);
                    role.setDescription("Patient role");
                    return roleRepository.save(role);
                });
    }
    
    @Test
    void testSignup() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");
        signupRequest.setEmail("john.doe@example.com");
        signupRequest.setPassword("Password@123");
        signupRequest.setPhoneNumber("+1234567890");
        signupRequest.setDateOfBirth(LocalDate.of(1990, 1, 1));
        signupRequest.setGender(User.Gender.MALE);
        signupRequest.setRole(Role.RoleName.PATIENT);
        
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"))
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testSignupWithExistingEmail() throws Exception {
        // Create existing user
        User existingUser = new User();
        existingUser.setFirstName("Existing");
        existingUser.setLastName("User");
        existingUser.setEmail("existing@example.com");
        existingUser.setPassword(passwordEncoder.encode("password"));
        existingUser.setRole(patientRole);
        existingUser.setIsActive(true);
        existingUser.setEmailVerified(true);
        userRepository.save(existingUser);
        
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("Password@123");
        signupRequest.setRole(Role.RoleName.PATIENT);
        
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already in use!"))
                .andExpect(jsonPath("$.success").value(false));
    }
    
    @Test
    void testSignin() throws Exception {
        // Create test user
        User testUser = new User();
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser.setRole(patientRole);
        testUser.setIsActive(true);
        testUser.setEmailVerified(true);
        userRepository.save(testUser);
        
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");
        
        mockMvc.perform(post("/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("PATIENT"));
    }
    
    @Test
    void testSigninWithInvalidCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("wrongpassword");
        
        mockMvc.perform(post("/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testChangePasswordSuccess() throws Exception {
        // Create user
        User u = new User();
        u.setFirstName("Paul");
        u.setLastName("Quinn");
        u.setEmail("cp_success@example.com");
        u.setPassword(passwordEncoder.encode("OldStrong1@"));
        u.setRole(patientRole);
        u.setIsActive(true);
        u.setEmailVerified(true);
        User saved = userRepository.save(u);

        // Prepare request body
        Map<String, String> body = new HashMap<>();
        body.put("currentPassword", "OldStrong1@");
        body.put("newPassword", "NewStrong1@");

        mockMvc.perform(post("/auth/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(saved)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testChangePasswordWrongCurrent() throws Exception {
        // Create user
        User u = new User();
        u.setFirstName("Peter");
        u.setLastName("Quincy");
        u.setEmail("cp_wrong@example.com");
        u.setPassword(passwordEncoder.encode("OldStrong1@"));
        u.setRole(patientRole);
        u.setIsActive(true);
        u.setEmailVerified(true);
        User saved = userRepository.save(u);

        Map<String, String> body = new HashMap<>();
        body.put("currentPassword", "Wrong1@");
        body.put("newPassword", "NewStrong1@");

        mockMvc.perform(post("/auth/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(saved)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testRefreshTokenFlow() throws Exception {
        // Create and login user to obtain refresh token
        User u = new User();
        u.setFirstName("Ryan");
        u.setLastName("Tate");
        u.setEmail("refresh_user@example.com");
        u.setPassword(passwordEncoder.encode("OldStrong1@"));
        u.setRole(patientRole);
        u.setIsActive(true);
        u.setEmailVerified(true);
        userRepository.save(u);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("refresh_user@example.com");
        loginRequest.setPassword("OldStrong1@");

        var loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String loginJson = loginResult.getResponse().getContentAsString();
        JsonNode loginNode = objectMapper.readTree(loginJson);
        String refreshToken = loginNode.get("refreshToken").asText();

        // Call refresh endpoint
        mockMvc.perform(post("/auth/refresh")
                .param("refreshToken", refreshToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }
}
