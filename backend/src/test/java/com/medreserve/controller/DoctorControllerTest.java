package com.medreserve.controller;

import com.medreserve.dto.DoctorResponse;
import com.medreserve.service.DoctorService;
import com.medreserve.config.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DoctorController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class))
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("webmvctest")
@DisplayName("Doctor Controller Tests")
class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorService doctorService;

    private List<DoctorResponse> mockDoctors;
    private List<String> mockSpecialties;

    @BeforeEach
    void setUp() {
        // Setup mock doctor responses
        DoctorResponse doctor1 = new DoctorResponse();
        doctor1.setId(1L);
        doctor1.setFirstName("Dr. John");
        doctor1.setLastName("Smith");
        doctor1.setSpecialty("CARDIOLOGY");
        doctor1.setYearsOfExperience(10);
        doctor1.setAverageRating(new BigDecimal("4.5"));
        doctor1.setConsultationFee(new BigDecimal("2000"));
        doctor1.setIsAvailable(true);

        DoctorResponse doctor2 = new DoctorResponse();
        doctor2.setId(2L);
        doctor2.setFirstName("Dr. Sarah");
        doctor2.setLastName("Johnson");
        doctor2.setSpecialty("DERMATOLOGY");
        doctor2.setYearsOfExperience(8);
        doctor2.setAverageRating(new BigDecimal("4.7"));
        doctor2.setConsultationFee(new BigDecimal("1500"));
        doctor2.setIsAvailable(true);

        mockDoctors = Arrays.asList(doctor1, doctor2);

        // Setup mock specialties
        mockSpecialties = Arrays.asList(
                "CARDIOLOGY", "DERMATOLOGY", "NEUROLOGY", 
                "ORTHOPEDICS", "PEDIATRICS", "PSYCHIATRY"
        );
    }

    @Test
    @DisplayName("Should return all available doctors")
    void testGetAllDoctors() throws Exception {
        // Given
        Page<DoctorResponse> doctorPage = new PageImpl<>(mockDoctors, PageRequest.of(0, 10), mockDoctors.size());
        when(doctorService.getAllDoctors(any())).thenReturn(doctorPage);

        // When & Then
        mockMvc.perform(get("/doctors")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].firstName").value("Dr. John"))
                .andExpect(jsonPath("$.content[0].specialty").value("CARDIOLOGY"))
                .andExpect(jsonPath("$.content[1].firstName").value("Dr. Sarah"))
                .andExpect(jsonPath("$.content[1].specialty").value("DERMATOLOGY"));
    }

    @Test
    @DisplayName("Should return empty list when no doctors available")
    void testGetAllDoctorsEmpty() throws Exception {
        // Given
        Page<DoctorResponse> emptyPage = new PageImpl<>(Arrays.asList(), PageRequest.of(0, 10), 0);
        when(doctorService.getAllDoctors(any())).thenReturn(emptyPage);

        // When & Then
        mockMvc.perform(get("/doctors"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    @DisplayName("Should search doctors by keyword")
    void testSearchDoctors() throws Exception {
        // Given
        Page<DoctorResponse> searchResults = new PageImpl<>(Arrays.asList(mockDoctors.get(0)), PageRequest.of(0, 10), 1);
        when(doctorService.searchDoctors(anyString(), any())).thenReturn(searchResults);

        // When & Then
        mockMvc.perform(get("/doctors/search")
                .param("keyword", "cardio")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].specialty").value("CARDIOLOGY"));
    }

    @Test
    @DisplayName("Should return all specialties")
    void testGetSpecialties() throws Exception {
        // Given
        when(doctorService.getAllSpecialties()).thenReturn(mockSpecialties);

        // When & Then
        mockMvc.perform(get("/doctors/specialties"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[0]").value("CARDIOLOGY"))
                .andExpect(jsonPath("$[1]").value("DERMATOLOGY"));
    }

    @Test
    @DisplayName("Should filter doctors by specialty")
    void testGetDoctorsBySpecialty() throws Exception {
        // Given
        List<DoctorResponse> cardiologists = Arrays.asList(mockDoctors.get(0));
        Page<DoctorResponse> specialtyPage = new PageImpl<>(cardiologists, PageRequest.of(0, 10), 1);
        when(doctorService.getDoctorsBySpecialty(anyString(), any())).thenReturn(specialtyPage);

        // When & Then
        mockMvc.perform(get("/doctors/specialty/CARDIOLOGY")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].specialty").value("CARDIOLOGY"));
    }

    @Test
    @DisplayName("Should get top rated doctors")
    void testGetTopRatedDoctors() throws Exception {
        // Given
        Page<DoctorResponse> topRatedPage = new PageImpl<>(mockDoctors, PageRequest.of(0, 5), mockDoctors.size());
        when(doctorService.getTopRatedDoctors(any())).thenReturn(topRatedPage);

        // When & Then
        mockMvc.perform(get("/doctors/top-rated")
                .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    @DisplayName("Should handle service errors gracefully")
    void testServiceError() throws Exception {
        // Given
        when(doctorService.getAllDoctors(any()))
                .thenThrow(new RuntimeException("Database connection error"));

        // When & Then
        mockMvc.perform(get("/doctors"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should validate pagination parameters")
    void testPaginationValidation() throws Exception {
        // Given
        Page<DoctorResponse> doctorPage = new PageImpl<>(mockDoctors, PageRequest.of(0, 10), mockDoctors.size());
        when(doctorService.getAllDoctors(any())).thenReturn(doctorPage);

        // When & Then - Test with valid pagination
        mockMvc.perform(get("/doctors")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk());

        // Test with invalid pagination (should use defaults)
        mockMvc.perform(get("/doctors")
                .param("page", "-1")
                .param("size", "0"))
                .andExpect(status().isOk());
    }
}
