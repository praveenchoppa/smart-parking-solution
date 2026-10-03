package com.smartparking.backend.ai.ai3.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class Ai3ClientConfig {

    @Value("${app.ai3.base-url:http://localhost:5002}")
    private String baseUrl;

    @Value("${app.ai3.timeout-ms:5000}")
    private int timeoutMs;

    @Bean(name = "ai3RestClient")
    public RestClient ai3RestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
