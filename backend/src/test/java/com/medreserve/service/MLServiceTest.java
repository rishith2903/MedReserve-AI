package com.medreserve.service;

import com.medreserve.dto.SpecialtyPredictionResponse;
import com.medreserve.dto.SymptomAnalysisRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@org.springframework.test.context.ActiveProfiles("test")
@TestPropertySource(properties = {
        "ml.service.url=http://ml.test"
})
class MLServiceTest {

    @Autowired
    private MLService mlService;

    @Autowired
    private RestTemplate restTemplate;

    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        server = MockRestServiceServer.bindTo(restTemplate).build();
    }

    @Test
    void predictSpecialty_fallbackOnServerError() {
        // Arrange
        server.expect(once(), requestTo("http://ml.test/predict-specialty"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        SymptomAnalysisRequest req = new SymptomAnalysisRequest();
        req.setSymptoms("chest pain and shortness of breath");
        req.setAge(45);
        req.setGender("male");

        // Act
        SpecialtyPredictionResponse resp = mlService.predictSpecialty(req, "dummy-token");

        // Assert (fallback path)
        assertThat(resp).isNotNull();
        assertThat(resp.getRecommendedSpecialty()).isEqualTo("Cardiology");
        assertThat(resp.getConfidenceScore()).isEqualTo(0.5);
        assertThat(resp.getPredictions()).isNotNull();
        assertThat(resp.getPredictions()).hasSize(1);

        server.verify();
    }
}