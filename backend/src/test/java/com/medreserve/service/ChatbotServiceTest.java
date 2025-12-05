package com.medreserve.service;

import com.medreserve.dto.ChatRequest;
import com.medreserve.dto.ChatResponse;
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
        "chatbot.service.url=http://chat.test"
})
class ChatbotServiceTest {

    @Autowired
    private ChatbotService chatbotService;

    @Autowired
    private RestTemplate restTemplate;

    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        server = MockRestServiceServer.bindTo(restTemplate).build();
    }

    @Test
    void processMessage_fallbackOnServerError() {
        // Arrange
        server.expect(once(), requestTo("http://chat.test/chat"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        ChatRequest req = new ChatRequest();
        req.setMessage("hello there");

        // Act
        ChatResponse resp = chatbotService.processMessage(req, "dummy-token");

        // Assert (fallback path)
        assertThat(resp).isNotNull();
        assertThat(resp.getIntent()).isEqualTo("greeting");
        assertThat(resp.getConfidence()).isEqualTo(0.5);
        assertThat(resp.getSuggestions()).isNotNull();
        assertThat(resp.getSuggestions()).contains("Book appointment");

        server.verify();
    }
}