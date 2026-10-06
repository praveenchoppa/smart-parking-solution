# Backend Gaps & API Contract Alignment Report

This document records the backend gaps, missing endpoints, and contract alignments identified during the frontend implementation against the Spring Boot codebase in [github.com/praveenchoppa/smart-parking-solution](https://github.com/praveenchoppa/smart-parking-solution).

---

## 🔍 Identified Backend Gaps

### 1. Executive Admin Dashboard Aggregate Endpoint
- **Gap**: The admin dashboard UI requires an aggregate system metrics overview (`totalParkingAreas`, `totalSlots`, `availableSlots`, `occupiedSlots`, `activeBookings`, `completedBookings`, `totalRevenue`, `overallOccupancyPercentage`). Currently, Spring Boot only exposes separate entity listing endpoints (`/api/parking-areas`, `/api/bookings`, `/api/users`).
- **Temporary Frontend Solution**: Handled client-side aggregation across lists or via typed mock fallback in `adminApi.getDashboardStats()`.
- **Action for Backend Developer**: Expose `GET /api/admin/dashboard` returning `DashboardStatsResponse`.

### 2. AI-3 Occupancy Forecast Endpoint
- **Gap**: The AI-3 Python model predicts hourly occupancy curves and peak traffic times. No controller currently exposes `/api/admin/reports/predictions` or `/api/ai/ai3/predictions` in Spring Boot.
- **Temporary Frontend Solution**: Handled via typed mock fallback in `adminApi.getPredictionReports()` returning `INITIAL_AI3_PREDICTIONS`.
- **Action for Backend Developer**: Add `Ai3PredictionController` with `GET /api/admin/reports/predictions`.

### 3. Slot Conflict HTTP 409 Payload Contract
- **Gap**: When concurrent users attempt to book the exact same parking slot, the backend throws a `ResourceConflictException`. The frontend expects a JSON error response with `status: 409` and a human-readable `message` ("This slot was just reserved by another driver.").
- **Action for Backend Developer**: Ensure `GlobalExceptionHandler` returns standard `ErrorResponse` with HTTP 409 status code.

### 4. Cors Preflight for Netlify CDN
- **Gap**: When deployed on Netlify or custom frontend domains, cross-origin REST calls to Spring Boot must allow credentials and headers (`Authorization`, `Content-Type`).
- **Action for Backend Developer**: Ensure `CorsConfig` sets `allowedOriginPatterns` to `*` or includes frontend Netlify domains.
