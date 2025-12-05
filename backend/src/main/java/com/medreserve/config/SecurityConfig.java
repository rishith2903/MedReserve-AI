package com.medreserve.config;

import com.medreserve.security.AuthTokenFilter;
import com.medreserve.service.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;

import java.util.Arrays;

@Configuration
@Profile("!webmvctest")
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Slf4j
public class SecurityConfig {
    
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthTokenFilter authTokenFilter;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService, AuthTokenFilter authTokenFilter) {
        this.userDetailsService = userDetailsService;
        this.authTokenFilter = authTokenFilter;
    }

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOriginsProperty;

    @Value("${app.security.hsts-enabled:false}")
    private boolean hstsEnabled;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public authentication endpoints
                .requestMatchers("/auth/login", "/auth/signup", "/auth/refresh", "/auth/signin").permitAll()

                // Public documentation and health endpoints
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/test/**", "/debug/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // Public READ endpoints for ML/Chatbot metadata and health
                .requestMatchers("/ml/health", "/ml/specialties").permitAll()
                .requestMatchers("/chatbot/health", "/chatbot/intents").permitAll()

                // Public doctor endpoints - Specific patterns first
                .requestMatchers("/doctors/specialties").permitAll()
                .requestMatchers("/doctors/search").permitAll()
                .requestMatchers("/doctors/specialty/**").permitAll()
                .requestMatchers("/doctors/filter/**").permitAll()
                .requestMatchers("/doctors/top-rated").permitAll()
                // Restricted doctor endpoints must come before the general GET matcher
                .requestMatchers("/doctors/register").hasAnyRole("ADMIN", "MASTER_ADMIN")
                .requestMatchers("/doctors/my-profile").hasRole("DOCTOR")
                .requestMatchers("/doctors/*/toggle-availability").hasRole("DOCTOR")
                // Permit GET access to single doctor resource and list
                .requestMatchers(HttpMethod.GET, "/doctors/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/doctors").permitAll()

                // Public smart features endpoints
                .requestMatchers("/smart-features/conditions/**").permitAll()
                .requestMatchers("/smart-features/**").permitAll()

                // Public AI analyze endpoint (project-compatible output)
                .requestMatchers("/ai/analyze-symptoms").permitAll()

                // Public health tips and medicines endpoints
                .requestMatchers("/health-tips/**").permitAll()
                .requestMatchers("/medicines/**").permitAll()
                .requestMatchers("/prescriptions/search").permitAll()

                // Public appointment slots (no auth needed to check availability)
                .requestMatchers("/appointments/doctor/*/available-slots").permitAll()

                // Role-based access for admin functions
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "MASTER_ADMIN")
                .requestMatchers("/master-admin/**").hasRole("MASTER_ADMIN")

                // Doctor-specific endpoints
                .requestMatchers("/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/appointments/doctor/my-appointments").hasRole("DOCTOR")

                // Patient-specific endpoints
                .requestMatchers("/patient/**").hasRole("PATIENT")
                .requestMatchers("/appointments/book").hasRole("PATIENT")
                .requestMatchers("/appointments/patient/my-appointments").hasRole("PATIENT")
                .requestMatchers("/appointments/*/reschedule").hasAnyRole("PATIENT", "DOCTOR")
                .requestMatchers("/appointments/*/cancel").hasAnyRole("PATIENT", "DOCTOR")
                .requestMatchers("/appointments/*").hasAnyRole("PATIENT", "DOCTOR")

                // Medical records - require authentication
                .requestMatchers("/medical-reports/**").authenticated()
                .requestMatchers("/prescriptions/**").authenticated()

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            // Security headers
            .headers(headers -> {
                headers.contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"));
                headers.referrerPolicy(ref -> ref.policy(ReferrerPolicy.SAME_ORIGIN));
                headers.frameOptions(frame -> frame.sameOrigin());
                headers.permissionsPolicy(pp -> pp.policy("geolocation=(), microphone=(), camera=()"));
                if (hstsEnabled) {
                    headers.httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000));
                }
            });
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Prefer property app.cors.allowed-origins (comma-separated). Fallback to CORS_ALLOWED_ORIGINS env if set.
        String effective = allowedOriginsProperty;
        String envOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
        if (envOrigins != null && !envOrigins.isEmpty()) {
            effective = envOrigins;
        }
        String[] origins = Arrays.stream(effective.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        log.info("CORS: Allowed origins: {}", Arrays.toString(origins));
        configuration.setAllowedOriginPatterns(Arrays.asList(origins));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
