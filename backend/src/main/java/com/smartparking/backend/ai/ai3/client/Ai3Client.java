package com.smartparking.backend.ai.ai3.client;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.smartparking.backend.ai.ai3.dto.Ai3PredictionRequest;
import com.smartparking.backend.ai.ai3.dto.Ai3PredictionResponse;
import com.smartparking.backend.ai.ai3.exception.Ai3ServiceUnavailableException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class Ai3Client {

    private final RestClient ai3RestClient;

    public Ai3Client(@Qualifier("ai3RestClient") RestClient ai3RestClient) {
        this.ai3RestClient = ai3RestClient;
    }

    public Ai3PredictionResponse predictOccupancy(Ai3PredictionRequest request) {
        return execute(() -> ai3RestClient.post()
                .uri("/predict")
                .body(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleErrorResponse)
                .body(Ai3PredictionResponse.class));
    }

    private <T> T execute(Ai3Call<T> call) {
        try {
            T result = call.run();
            if (result == null) {
                throw new Ai3ServiceUnavailableException("AI-3 returned an empty response.");
            }
            return result;
        } catch (Ai3ServiceUnavailableException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            log.warn("AI-3 service is unreachable: {}", ex.getMessage());
            throw new Ai3ServiceUnavailableException(
                    "AI-3 occupancy prediction service is unavailable. Please ensure AI-3 is running.");
        } catch (RestClientException ex) {
            log.warn("AI-3 request failed: {}", ex.getMessage());
            throw new Ai3ServiceUnavailableException(
                    "AI-3 occupancy prediction service is unavailable. Please ensure AI-3 is running.");
        } catch (Exception ex) {
            log.warn("AI-3 response processing failed: {}", ex.getMessage());
            throw new Ai3ServiceUnavailableException(
                    "AI-3 occupancy prediction service returned an invalid or malformed response.");
        }
    }

    private void handleErrorResponse(
            org.springframework.http.HttpRequest request,
            org.springframework.http.client.ClientHttpResponse response) throws IOException {
        String body = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
        String message = extractErrorMessage(body);
        throw new Ai3ServiceUnavailableException(message);
    }

    private String extractErrorMessage(String body) {
        if (body == null || body.isBlank()) {
            return "AI-3 occupancy prediction service returned an error.";
        }

        int markerIndex = body.indexOf("\"error\"");
        if (markerIndex >= 0) {
            int colonIndex = body.indexOf(':', markerIndex);
            int firstQuote = body.indexOf('"', colonIndex + 1);
            int secondQuote = body.indexOf('"', firstQuote + 1);
            if (firstQuote >= 0 && secondQuote > firstQuote) {
                return body.substring(firstQuote + 1, secondQuote);
            }
        }

        return "AI-3 occupancy prediction service returned an error.";
    }

    @FunctionalInterface
    private interface Ai3Call<T> {
        T run();
    }
}
