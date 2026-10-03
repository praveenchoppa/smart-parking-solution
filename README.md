# 🅿️ Smart Urban Parking Solution — Full Monorepo

> An end-to-end, intelligent urban parking platform integrating real-time CCTV computer vision (AI-1), machine learning slot recommendation (AI-2), occupancy prediction (AI-3), a Spring Boot backend, PostgreSQL database, and a Vite React user/admin frontend.

---

## 🏗️ System Architecture

```
React / Vite Frontend (Port 5173)
        │
        ▼ (REST API)
Spring Boot Backend (Port 8080)
        │
        ├──────► PostgreSQL Database (Port 5432)
        │
        └──────► AI Microservices
                    │
                    ├──► AI-1: Parking Slot Occupancy Detection (Flask @ Port 5000)
                    ├──► AI-2: Parking Slot Recommendation (Flask @ Port 5001)
                    └──► AI-3: Occupancy Prediction (Flask @ Port 5002)
```

---

## 🚀 Quick Start Guide

For full execution details, environment setup, and fault injection tests, see **[RUNBOOK.md](RUNBOOK.md)**.

### Dependency Order Execution Summary

1. **PostgreSQL Database**: Port `5432` (`smart_parking`)
2. **AI-1 Occupancy Detection**:
   ```bash
   cd ai/module1 && python server.py
   ```
3. **AI-2 Slot Recommendation**:
   ```bash
   cd ai/module2/parking_recommendation && python app.py
   ```
4. **AI-3 Occupancy Prediction**:
   ```bash
   cd ai/module3 && python app.py
   ```
5. **Spring Boot Backend**:
   ```bash
   cd backend && mvn spring-boot:run
   ```
6. **React Frontend**:
   ```bash
   cd frontend && npm run dev
   ```
