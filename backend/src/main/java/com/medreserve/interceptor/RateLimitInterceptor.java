package com.medreserve.interceptor;

import com.medreserve.config.RateLimitingConfig;
import com.medreserve.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private final RateLimitingConfig rateLimitingConfig;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // Skip rate limiting for CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Get user identifier
        String userKey = getUserKey(request);

        // Determine rate limit type based on endpoint
        RateLimitingConfig.RateLimitType limitType = determineLimitType(request.getRequestURI());

        // Check rate limit
        if (!rateLimitingConfig.tryConsume(userKey, limitType)) {
            log.warn("Rate limit exceeded for user: {} on endpoint: {}", userKey, request.getRequestURI());

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Rate limit exceeded. Please try again later.\",\"code\":\"RATE_LIMIT_EXCEEDED\"}");
            return false;
        }

        return true;
    }
    
    private String getUserKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return "user_" + user.getId();
        }
        
        // Fallback to IP address for unauthenticated requests
        String clientIp = getClientIpAddress(request);
        return "ip_" + clientIp;
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private RateLimitingConfig.RateLimitType determineLimitType(String requestURI) {
        // Remove context path for consistent matching
        String normalizedURI = requestURI.startsWith("/api/") ? requestURI.substring(4) : requestURI;

        if (normalizedURI.startsWith("/auth/login") || normalizedURI.startsWith("/auth/signin")) {
            return RateLimitingConfig.RateLimitType.LOGIN;
        } else if (normalizedURI.contains("/ml/")) {
            return RateLimitingConfig.RateLimitType.ML_PREDICTION;
        } else if (normalizedURI.contains("/chatbot/")) {
            return RateLimitingConfig.RateLimitType.CHAT;
        } else if (normalizedURI.contains("/upload") || normalizedURI.contains("/medical-reports") || normalizedURI.contains("/prescriptions")) {
            return RateLimitingConfig.RateLimitType.FILE_UPLOAD;
        } else {
            return RateLimitingConfig.RateLimitType.GENERAL;
        }
    }
}
