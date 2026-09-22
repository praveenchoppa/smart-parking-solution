package com.smartparking.backend.ai.ai2.client;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.smartparking.backend.ai.ai2.dto.Ai2RecommendationItemDto;
import com.smartparking.backend.ai.ai2.dto.Ai2SlotInputDto;
import com.smartparking.backend.ai.ai2.exception.Ai2ServiceUnavailableException;

import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Slf4j
@Component
public class Ai2Client {

    private final RestClient ai2RestClient;
    private final JsonMapper jsonMapper;

    public Ai2Client(
            @Qualifier("ai2RestClient") RestClient ai2RestClient,
            JsonMapper jsonMapper) {
        this.ai2RestClient = ai2RestClient;
        this.jsonMapper = jsonMapper;
    }

    public List<Ai2RecommendationItemDto> recommend(List<Ai2SlotInputDto> slotInputs) {
        if (slotInputs == null || slotInputs.isEmpty()) {
            return Collections.emptyList();
        }

        return execute(() -> {
            String responseBody = ai2RestClient.post()
                    .uri("/recommend")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(slotInputs)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, this::handleErrorResponse)
                    .body(String.class);

            return parseRecommendations(responseBody);
        });
    }

    private List<Ai2RecommendationItemDto> parseRecommendations(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            throw new Ai2ServiceUnavailableException("AI-2 returned an empty recommendation response.");
        }

        String trimmed = responseBody.trim();
        if (trimmed.startsWith("[")) {
            return jsonMapper.readValue(trimmed, new TypeReference<List<Ai2RecommendationItemDto>>() {
            });
        }

        if (trimmed.startsWith("{")) {
            log.info("AI-2 recommendation response: {}", trimmed);
            return Collections.emptyList();
        }

        throw new Ai2ServiceUnavailableException("AI-2 returned an unexpected recommendation response format.");
    }

    private <T> T execute(Ai2Call<T> call) {
        try {
            return call.run();
        } catch (Ai2ServiceUnavailableException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            log.warn("AI-2 service is unreachable: {}", ex.getMessage());
            throw new Ai2ServiceUnavailableException(
                    "AI-2 parking recommendation service is unavailable. Please ensure AI-2 is running.");
        } catch (RestClientException ex) {
            log.warn("AI-2 request failed: {}", ex.getMessage());
            throw new Ai2ServiceUnavailableException(
                    "AI-2 parking recommendation service is unavailable. Please ensure AI-2 is running.");
        }
    }

    private void handleErrorResponse(
            org.springframework.http.HttpRequest request,
            org.springframework.http.client.ClientHttpResponse response) throws IOException {
        String body = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
        String message = extractErrorMessage(body);
        throw new Ai2ServiceUnavailableException(message);
    }

    private String extractErrorMessage(String body) {
        if (body == null || body.isBlank()) {
            return "AI-2 parking recommendation service returned an error.";
        }

        String extracted = extractJsonStringField(body, "error");
        if (extracted != null) {
            return extracted;
        }

        extracted = extractJsonStringField(body, "message");
        if (extracted != null) {
            return extracted;
        }

        return "AI-2 parking recommendation service returned an error.";
    }

    private String extractJsonStringField(String body, String fieldName) {
        String marker = "\"" + fieldName + "\"";
        int markerIndex = body.indexOf(marker);
        if (markerIndex < 0) {
            return null;
        }
        int colonIndex = body.indexOf(':', markerIndex);
        int firstQuote = body.indexOf('"', colonIndex + 1);
        int secondQuote = body.indexOf('"', firstQuote + 1);
        if (firstQuote >= 0 && secondQuote > firstQuote) {
            return body.substring(firstQuote + 1, secondQuote);
        }
        return null;
    }

    @FunctionalInterface
    private interface Ai2Call<T> {
        T run();
    }
}
