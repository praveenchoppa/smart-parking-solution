# 📖 Smart Parking Solution — Monorepo Operations Runbook

> **System Overview**: End-to-end execution guide for the Smart Parking Solution monorepo integrating `ai/` (AI-1, AI-2, AI-3 microservices), `backend/` (Spring Boot 4.0.7), and `frontend/` (React + Vite).

---

## 🛠️ System Prerequisites & Ports

| Service | Technology / Stack | Port | Health Endpoint |
| :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | PostgreSQL 14+ | `5432` | `jdbc:postgresql://localhost:5432/smart_parking` |
| **AI-1 Occupancy Detection** | Python 3.10+ / Flask / OpenCV | `5000` | `http://localhost:5000/api/v1/areas` |
| **AI-2 Recommendation** | Python 3.10+ / Flask / Scikit-Learn | `5001` | `http://localhost:5001/` |
| **AI-3 Prediction** | Python 3.10+ / Flask / Scikit-Learn | `5002` | `http://localhost:5002/` |
| **Spring Boot Backend** | Java 21 / Spring Boot 4.0.7 / Maven | `8080` | `http://localhost:8080/api/parking-areas` |
| **React Frontend** | React 18 / Vite / Tailwind CSS | `5173` | `http://localhost:5173/` |

---

## 🔑 Environment Configuration & Flags

### 1. Database Configuration
The backend connects to **PostgreSQL**.
```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/smart_parking}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}
```

### 2. `AI1_DEMO_BOOTSTRAP_ENABLED` (Default: `true`)
- **Behavior**: When set to `true`, Spring Boot checks PostgreSQL at startup. If Parking Area ID `1` ("City Mall Main Lot") is missing, it automatically creates Area 1 with 69 slots (`A01` to `A69`).
- **Effect**: Guarantees that fresh database clones automatically contain Area 1 ready to sync with AI-1 (`carPark.mp4`) out of the box.

### 3. `AI1_SCHEDULED_SYNC_ENABLED` (Default: `true`)
- **Behavior**: When set to `true`, Spring Boot executes a background `@Scheduled` task every 10,000 ms (`AI1_SCHEDULED_SYNC_INTERVAL_MS`).
- **Effect**: Periodically fetches AI-1 physical occupancy (`AVAILABLE`/`OCCUPIED`) and merges it into PostgreSQL without overwriting active user reservations (`RESERVED`).

### 4. ⚠️ `JWT_SECRET` Dev Fallback Security Warning
- **Warning**: `application.properties` includes a default dev secret fallback (`dev-only-change-this-jwt-secret-key-32`).
- **Action**: `JWT_SECRET` **MUST** be set in local `.env` to a secure random string (at least 32 characters) before any shared demonstration, staging deployment, or production submission. Do not rely on the fallback secret in non-dev environments.

---

## 🚀 Execution Guide (Dependency Order)

### Step 1: Start PostgreSQL & Create Database
Ensure PostgreSQL server is running on port `5432`.
```sql
CREATE DATABASE smart_parking;
```

### Step 2: Start AI-1 Occupancy Detection Service (Port 5000)
```powershell
cd ai/module1
..\..\.venv\Scripts\python.exe server.py
```
*Verify*: `curl http://localhost:5000/api/v1/areas`

### Step 3: Start AI-2 Recommendation Service (Port 5001)
```powershell
cd ai/module2/parking_recommendation
..\..\..\.venv\Scripts\python.exe app.py
```
*Verify*: `curl http://localhost:5001/`

### Step 4: Start AI-3 Prediction Service (Port 5002)
```powershell
cd ai/module3
..\..\.venv\Scripts\python.exe app.py
```
*Verify*: `curl http://localhost:5002/`

### Step 5: Start Spring Boot Backend (Port 8080)
```powershell
cd backend
mvn spring-boot:run
```
*Verify*: `curl http://localhost:8080/api/parking-areas`

### Step 6: Start React Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:5173`.

---

## 🌐 Browser-Based & E2E Verification Protocol

> [!IMPORTANT]
> Curl tests confirm backend health, but CORS must be verified inside an actual browser (Chrome / Edge / Firefox).

### 1. Browser Verification & CORS
1. Open Google Chrome and navigate to `http://localhost:5173`.
2. Open Chrome Developer Tools (`F12`) -> **Console** and **Network** tabs.
3. Log in or view parking areas. Verify HTTP responses return `200 OK` with CORS header `Access-Control-Allow-Origin: http://localhost:5173`.

### 2. End-to-End User Booking Flow Test
1. **Register / Login**: Create a user account on frontend.
2. **View Occupancy**: View slots for City Mall Main Lot (Area 1). Confirm slots display live statuses (`AVAILABLE`, `OCCUPIED`).
3. **Create Reservation**: Book slot `A01` for 1 hour. Confirm status updates to `RESERVED` in database and frontend.
4. **Verify Reservation Overlay**: Trigger AI-1 sync (`POST /api/ai/ai1/parking-areas/1/sync`). Verify slot `A01` remains `RESERVED` (business rules override physical camera detection).

---

## 🧪 Fault Injection & Resilience Protocol

1. **Stop AI-1 Service (`Ctrl+C` on port 5000)**:
   - Call `GET /api/ai/ai1/parking-areas/1/occupancy` via Backend.
   - **Expected**: Backend catches `ResourceAccessException` and returns `503 Service Unavailable` with message `"AI-1 occupancy detection service is unavailable"`. System does not hang or crash.
2. **Stop PostgreSQL Database**:
   - Backend logs database connection failure gracefully and returns `500` error on DB queries.
3. **Stop Backend Service (`Ctrl+C` on port 8080)**:
   - Frontend displays clear user toast: `"Unable to reach Spring Boot backend server."`
