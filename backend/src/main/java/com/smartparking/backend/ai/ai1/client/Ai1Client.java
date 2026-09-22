package com.smartparking.backend.ai.ai1.client;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.smartparking.backend.ai.ai1.dto.Ai1AreaInfoDto;
import com.smartparking.backend.ai.ai1.dto.Ai1OccupancyResponse;
import com.smartparking.backend.ai.ai1.exception.Ai1ServiceUnavailableException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class Ai1Client {

    private final RestClient ai1RestClient;

    public Ai1Client(@Qualifier("ai1RestClient") RestClient ai1RestClient) {
        this.ai1RestClient = ai1RestClient;
    }

    public List<Ai1AreaInfoDto> fetchAreas() {
        return execute(() -> ai1RestClient.get()
                .uri("/api/v1/areas")
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleErrorResponse)
                .body(new ParameterizedTypeReference<List<Ai1AreaInfoDto>>() {
                }));
    }

    public Ai1OccupancyResponse fetchOccupancy(Long parkingAreaId) {
        return execute(() -> ai1RestClient.get()
                .uri("/api/v1/occupancy/{parkingAreaId}", parkingAreaId)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleErrorResponse)
                .body(Ai1OccupancyResponse.class));
    }

    private <T> T execute(Ai1Call<T> call) {
        try {
            T result = call.run();
            if (result == null) {
                throw new Ai1ServiceUnavailableException("AI-1 returned an empty response.");
            }
            return result;
        } catch (Ai1ServiceUnavailableException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            log.warn("AI-1 service is unreachable: {}", ex.getMessage());
            throw new Ai1ServiceUnavailableException(
                    "AI-1 occupancy detection service is unavailable. Please ensure AI-1 is running.");
        } catch (RestClientException ex) {
            log.warn("AI-1 request failed: {}", ex.getMessage());
            throw new Ai1ServiceUnavailableException(
                    "AI-1 occupancy detection service is unavailable. Please ensure AI-1 is running.");
        }
    }

    private void handleErrorResponse(
            org.springframework.http.HttpRequest request,
            org.springframework.http.client.ClientHttpResponse response) throws IOException {
        String body = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
        String message = extractErrorMessage(body);
        throw new Ai1ServiceUnavailableException(message);
    }

    private String extractErrorMessage(String body) {
        if (body == null || body.isBlank()) {
            return "AI-1 occupancy detection service returned an error.";
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

        return "AI-1 occupancy detection service returned an error.";
    }

    @FunctionalInterface
    private interface Ai1Call<T> {
        T run();
    }
}
