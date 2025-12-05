package com.medreserve.controller;

import com.medreserve.dto.JwtResponse;
import com.medreserve.dto.LoginRequest;
import com.medreserve.dto.MessageResponse;
import com.medreserve.dto.SignupRequest;
import com.medreserve.dto.UserProfileUpdateRequest;
import com.medreserve.dto.ChangePasswordRequest;
import com.medreserve.entity.User;
import com.medreserve.service.AuthService;
import com.medreserve.security.LoginAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    
    private final AuthService authService;
    private final LoginAttemptService loginAttemptService;
    
    @PostMapping("/signin")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String key = loginRequest.getEmail();
        if (loginAttemptService.isLocked(key)) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Too many failed login attempts. Please try again later."));
        }
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            loginAttemptService.loginSucceeded(key);
            return ResponseEntity.ok(jwtResponse);
        } catch (BadCredentialsException e) {
            loginAttemptService.loginFailed(key);
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Invalid email or password"));
        } catch (DisabledException e) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Account is disabled"));
        } catch (LockedException e) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Account is locked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login (alias)", description = "Authenticate user and return JWT tokens - alias for /signin")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        String key = loginRequest.getEmail();
        if (loginAttemptService.isLocked(key)) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Too many failed login attempts. Please try again later."));
        }
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            loginAttemptService.loginSucceeded(key);
            return ResponseEntity.ok(jwtResponse);
        } catch (BadCredentialsException e) {
            loginAttemptService.loginFailed(key);
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Invalid email or password"));
        } catch (DisabledException e) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Account is disabled"));
        } catch (LockedException e) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Account is locked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Authentication failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/signup")
    @Operation(summary = "User registration", description = "Register a new user")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            MessageResponse response = authService.registerUser(signUpRequest);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Registration failed"));
        }
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get new access token using refresh token")
    public ResponseEntity<JwtResponse> refreshToken(@RequestParam String refreshToken) {
        try {
            JwtResponse jwtResponse = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user details")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(currentUser);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update current user's profile information")
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody UserProfileUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            User updatedUser = authService.updateUserProfile(currentUser.getId(), request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change current user's password")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            authService.changePassword(currentUser.getId(), request);
            return ResponseEntity.ok(MessageResponse.success("Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(MessageResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(MessageResponse.error("Failed to change password"));
        }
    }

    @PostMapping("/signout")
    @Operation(summary = "User logout", description = "Logout user (client should remove tokens)")
    public ResponseEntity<MessageResponse> logoutUser() {
        // In a real application, you might want to blacklist the token
        return ResponseEntity.ok(MessageResponse.success("User logged out successfully!"));
    }
}
