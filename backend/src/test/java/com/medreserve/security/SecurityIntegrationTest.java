package com.medreserve.security;

import com.medreserve.entity.Doctor;
import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.RoleRepository;
import com.medreserve.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "security.jwt.secret=dev-0123456789-abcdefghijklmnopqrstuvwxyz-012345",
        "management.health.mail.enabled=false"
})
class SecurityIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private User doctorAUser;
    private Doctor doctorA;
    private User doctorBUser;
    private Doctor doctorB;

    @BeforeEach
    void setupData() {
        // Ensure DOCTOR role exists
        Role doctorRole = roleRepository.findByName(Role.RoleName.DOCTOR)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(Role.RoleName.DOCTOR);
                    return roleRepository.save(r);
                });

        // Doctor A
        doctorAUser = userRepository.findByEmail("sec-test-doctor-a@local.test").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Doc");
            u.setLastName("Alpha");
            u.setEmail("sec-test-doctor-a@local.test");
            u.setPassword("StrongPass1!");
            u.setRole(doctorRole);
            u.setIsActive(true);
            u.setEmailVerified(true);
            return userRepository.save(u);
        });
        doctorA = doctorRepository.findByUserId(doctorAUser.getId()).orElseGet(() -> {
            Doctor d = new Doctor();
            d.setUser(doctorAUser);
            d.setLicenseNumber("LIC-A-001");
            d.setSpecialty("Cardiology");
            d.setYearsOfExperience(5);
            d.setQualification("MBBS");
            d.setConsultationFee(new BigDecimal("500.00"));
            d.setIsAvailable(true);
            return doctorRepository.save(d);
        });

        // Doctor B
        doctorBUser = userRepository.findByEmail("sec-test-doctor-b@local.test").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Doc");
            u.setLastName("Beta");
            u.setEmail("sec-test-doctor-b@local.test");
            u.setPassword("StrongPass1!");
            u.setRole(doctorRole);
            u.setIsActive(true);
            u.setEmailVerified(true);
            return userRepository.save(u);
        });
        doctorB = doctorRepository.findByUserId(doctorBUser.getId()).orElseGet(() -> {
            Doctor d = new Doctor();
            d.setUser(doctorBUser);
            d.setLicenseNumber("LIC-B-001");
            d.setSpecialty("Dermatology");
            d.setYearsOfExperience(8);
            d.setQualification("MBBS");
            d.setConsultationFee(new BigDecimal("600.00"));
            d.setIsAvailable(true);
            return doctorRepository.save(d);
        });
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private String bearer(String token) { return "Bearer " + token; }

    @Test
    void actuatorHealth_isPublic() {
        ResponseEntity<String> resp = rest.getForEntity(url("/actuator/health"), String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void appointmentsBook_withoutToken_is401() {
        // Arbitrary payload (should not reach controller due to 401)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> req = new HttpEntity<>("{\"doctorId\":1,\"appointmentDateTime\":\"2030-01-01T10:00:00\",\"appointmentType\":\"ONLINE\"}", headers);
        ResponseEntity<String> resp = rest.postForEntity(url("/appointments/book"), req, String.class);
        assertThat(resp.getStatusCode().value()).isIn(401, 403); // 401 or 403 depending on entry point
    }

    @Test
    void doctorToggleAvailability_selfIs200_otherIs403() {
        // Token for doctor A
        String tokenA = jwtUtils.generateJwtToken(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                doctorAUser, null, doctorAUser.getAuthorities()));
        // Token for doctor B
        String tokenB = jwtUtils.generateJwtToken(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                doctorBUser, null, doctorBUser.getAuthorities()));

        // Doctor A toggles own availability -> 200
        HttpHeaders hA = new HttpHeaders();
        hA.set("Authorization", bearer(tokenA));
        HttpEntity<Void> rA = new HttpEntity<>(hA);
        ResponseEntity<String> selfResp = rest.exchange(url("/doctors/" + doctorA.getId() + "/toggle-availability"), HttpMethod.PUT, rA, String.class);
        assertThat(selfResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Doctor A attempts to toggle Doctor B -> 403
        HttpHeaders hB = new HttpHeaders();
        hB.set("Authorization", bearer(tokenA));
        HttpEntity<Void> rB = new HttpEntity<>(hB);
        ResponseEntity<String> otherResp = rest.exchange(url("/doctors/" + doctorB.getId() + "/toggle-availability"), HttpMethod.PUT, rB, String.class);
        assertThat(otherResp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // Admin/MASTER_ADMIN bypass would be tested separately if roles seeded
    }
}
