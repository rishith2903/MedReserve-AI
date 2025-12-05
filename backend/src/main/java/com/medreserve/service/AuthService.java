package com.medreserve.service;

import com.medreserve.dto.JwtResponse;
import com.medreserve.dto.LoginRequest;
import com.medreserve.dto.MessageResponse;
import com.medreserve.dto.SignupRequest;
import com.medreserve.dto.UserProfileUpdateRequest;
import com.medreserve.dto.ChangePasswordRequest;
import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.repository.RoleRepository;
import com.medreserve.repository.UserRepository;
import com.medreserve.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    
    @Value("${app.auth.auto-verify-signup:true}")
    private boolean autoVerifySignup;
    
    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        return new JwtResponse(jwt, refreshToken, user.getId(), user.getEmail(), 
                              user.getFirstName(), user.getLastName(), 
                              user.getRole().getName().name());
    }
    
    @Transactional
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return MessageResponse.error("Email is already in use!");
        }
        
        // Check if phone number already exists
        if (signUpRequest.getPhoneNumber() != null && 
            userRepository.existsByPhoneNumber(signUpRequest.getPhoneNumber())) {
            return MessageResponse.error("Phone number is already in use!");
        }
        
        // Get role (default to PATIENT if not specified)
        Role.RoleName roleName = signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.RoleName.PATIENT;
        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        
        // Create new user
        User user = new User();
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setPhoneNumber(signUpRequest.getPhoneNumber());
        user.setDateOfBirth(signUpRequest.getDateOfBirth());
        user.setGender(signUpRequest.getGender());
        user.setAddress(signUpRequest.getAddress());
        user.setRole(userRole);
        user.setIsActive(true);
        // Email verification policy (configurable)
        user.setEmailVerified(autoVerifySignup);
        
        userRepository.save(user);
        
        log.info("User registered successfully: id={}", user.getId());
        return MessageResponse.success("User registered successfully!");
    }
    
    public JwtResponse refreshToken(String refreshToken) {
        if (jwtUtils.validateJwtToken(refreshToken)) {
            String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            String newAccessToken = jwtUtils.generateTokenFromUsername(username, 86400000); // 24 hours

            return new JwtResponse(newAccessToken, refreshToken, user.getId(), user.getEmail(),
                                  user.getFirstName(), user.getLastName(),
                                  user.getRole().getName().name());
        } else {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    @Transactional
    public User updateUserProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is being changed and if it's already in use by another user
        if (!user.getEmail().equals(request.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use by another user");
        }

        // Check if phone number is being changed and if it's already in use by another user
        if (request.getPhoneNumber() != null &&
            !request.getPhoneNumber().equals(user.getPhoneNumber()) &&
            userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number is already in use by another user");
        }

        // Update user fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());

        user = userRepository.save(user);

        log.info("User profile updated: {}", user.getEmail());
        return user;
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Prevent using the same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: id={}", user.getId());
    }
}
