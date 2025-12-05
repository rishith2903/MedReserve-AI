package com.medreserve.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.Timeout;
import org.apache.hc.core5.util.TimeValue;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Value("${http.client.connect-timeout-ms:5000}")
    private int connectTimeoutMs;

    @Value("${http.client.read-timeout-ms:10000}")
    private int readTimeoutMs;

    @Value("${http.client.max-total-connections:200}")
    private int maxTotalConnections;

    @Value("${http.client.max-per-route-connections:50}")
    private int maxPerRouteConnections;

    @Bean
    public RestTemplate restTemplate() {
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(Timeout.ofMilliseconds(connectTimeoutMs))
                .setResponseTimeout(Timeout.ofMilliseconds(readTimeoutMs))
                .build();

        PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
        cm.setMaxTotal(maxTotalConnections);
        cm.setDefaultMaxPerRoute(maxPerRouteConnections);

        HttpClient httpClient = HttpClients.custom()
                .setConnectionManager(cm)
                .setDefaultRequestConfig(requestConfig)
                .evictExpiredConnections()
                .evictIdleConnections(TimeValue.ofSeconds(30))
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        factory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        factory.setConnectionRequestTimeout(Duration.ofMillis(connectTimeoutMs));
        // Spring 6 uses setResponseTimeout on underlying config; setReadTimeout(Duration) is available in recent versions.
        // If unavailable, the RequestConfig above already enforces it.
        return new RestTemplate(factory);
    }
}
