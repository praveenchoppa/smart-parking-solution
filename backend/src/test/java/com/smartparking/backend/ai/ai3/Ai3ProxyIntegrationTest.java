package com.smartparking.backend.ai.ai3;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.smartparking.backend.ai.ai3.client.Ai3Client;
import com.smartparking.backend.ai.ai3.controller.Ai3PredictionController;
import com.smartparking.backend.ai.ai3.dto.Ai3PredictionRequest;
import com.smartparking.backend.ai.ai3.dto.Ai3PredictionResponse;
import com.smartparking.backend.ai.ai3.exception.Ai3ServiceUnavailableException;
import com.smartparking.backend.ai.ai3.service.Ai3PredictionService;
import com.smartparking.backend.common.exception.GlobalExceptionHandler;

@SpringBootTest
class Ai3ProxyIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private Ai3PredictionController ai3PredictionController;

    @MockitoBean
    private Ai3Client ai3Client;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(ai3PredictionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Scenario 1: Successful AI-3 prediction call returns 200 OK with prediction payload")
    void testSuccessfulPredictionCall() throws Exception {
        Ai3PredictionResponse mockResponse = Ai3PredictionResponse.builder()
                .predictedOccupancy(42.5)
                .predictedOccupiedSlots(29)
                .availableSlots(40)
                .build();

        when(ai3Client.predictOccupancy(any(Ai3PredictionRequest.class))).thenReturn(mockResponse);

        String jsonPayload = """
                {
                    "date": "2026-10-03",
                    "time": "14:30",
                    "parkingAreaId": "A01",
                    "totalSlots": 69,
                    "previousOccupancy": 35.0,
                    "currentOccupancy": 40.0
                }
                """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/ai/ai3/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.predicted_occupancy").value(42.5))
                .andExpect(MockMvcResultMatchers.jsonPath("$.predicted_occupied_slots").value(29))
                .andExpect(MockMvcResultMatchers.jsonPath("$.available_slots").value(40));
    }

    @Test
    @DisplayName("Scenario 2: AI-3 unreachable returns 503 Service Unavailable clean error response (no crash or hang)")
    void testAi3UnreachableReturns503() throws Exception {
        when(ai3Client.predictOccupancy(any(Ai3PredictionRequest.class)))
                .thenThrow(new Ai3ServiceUnavailableException(
                        "AI-3 occupancy prediction service is unavailable. Please ensure AI-3 is running."));

        String jsonPayload = """
                {
                    "date": "2026-10-03",
                    "time": "14:30",
                    "parkingAreaId": "A01",
                    "totalSlots": 69,
                    "previousOccupancy": 35.0,
                    "currentOccupancy": 40.0
                }
                """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/ai/ai3/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(MockMvcResultMatchers.status().isServiceUnavailable())
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(503))
                .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Service Unavailable"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("AI-3 occupancy prediction service is unavailable. Please ensure AI-3 is running."));
    }

    @Test
    @DisplayName("Scenario 3: Malformed AI-3 response returns 503 Service Unavailable gracefully without unhandled exceptions")
    void testMalformedAi3ResponseHandledGracefully() throws Exception {
        when(ai3Client.predictOccupancy(any(Ai3PredictionRequest.class)))
                .thenThrow(new Ai3ServiceUnavailableException(
                        "AI-3 occupancy prediction service returned an invalid or malformed response."));

        String jsonPayload = """
                {
                    "date": "2026-10-03",
                    "time": "14:30",
                    "parkingAreaId": "A01",
                    "totalSlots": 69,
                    "previousOccupancy": 35.0,
                    "currentOccupancy": 40.0
                }
                """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/ai/ai3/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(MockMvcResultMatchers.status().isServiceUnavailable())
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(503))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("AI-3 occupancy prediction service returned an invalid or malformed response."));
    }
}
