# Smart Urban Parking Solution — Frontend Guide

Production-quality React application for the **Smart Urban Parking Solution** college project. Built to interface with the authoritative Spring Boot backend REST API and integrated AI microservices (AI-1 Computer Vision Occupancy, AI-2 Smart Recommendation Engine, and AI-3 Occupancy Prediction Analytics).

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Access locally at [http://localhost:3000](http://localhost:3000).

### 3. Production Build
```bash
npm run build
```

---

## ⚙️ Environment Configuration (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_MOCK_FALLBACK=true
```

- **`VITE_API_BASE_URL`**: Base URL of the live Spring Boot REST API.
- **`VITE_ENABLE_MOCK_FALLBACK`**: Set `true` during offline frontend development or backend maintenance. The Axios API client will automatically fall back to typed in-memory repositories without breaking UI flows.

---

## 📁 Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── booking/          # QRCard.jsx (Boarding pass style pass) & BookingSummary.jsx
│   ├── common/           # Button, Input, Select, Modal, Sheet, Skeleton, StatusBadge, StatCard
│   ├── parking/          # ParkingCard.jsx, SlotCard.jsx, SlotGrid.jsx (Theatre style layout)
│   └── vehicle/          # VehicleCard.jsx
├── context/              # AuthContext.jsx (JWT Bearer token management & role session state)
├── hooks/                # useLocation.js (HTML5 Geolocation hook)
├── layouts/              # UserLayout.jsx (Header, Navigation, Profile drawer)
├── pages/
│   ├── admin/            # AdminDashboard, AdminParkingManagement, AdminSlotManagement, AdminBookingManagement, AdminQRScanner, AdminReports
│   ├── auth/             # Login & Register
│   └── user/             # Dashboard, Home, ParkingDetails, SlotSelection, VehicleManagement, BookingConfirmation, Payment, BookingSuccess, QRBookingPass, CurrentBooking, BookingHistory, BookingDetails, Profile
├── services/
│   ├── api/              # Axios HTTP client with JWT interceptors (401 logout) & API modules
│   └── mock/             # Centralized sharedMockRepository
└── utils/                # formatters.js (INR currency, Haversine distance, dates, badges)
```

---

## 🔗 Endpoint Mapping

| UI Action / Screen | Backend Endpoint | Method | Role |
| :--- | :--- | :--- | :--- |
| Login | `/api/auth/login` | `POST` | Public |
| Register | `/api/auth/register` | `POST` | Public |
| Nearby Parking (500m) | `/api/parking-areas/nearby` | `GET` | Authenticated |
| Parking Details | `/api/parking-areas/{id}` | `GET` | Authenticated |
| Slot Selection Grid | `/api/parking-areas/{id}/slots` | `GET` | Authenticated |
| AI-1 Vision Sync | `/api/ai/ai1/parking-areas/{id}/sync` | `POST` | ADMIN |
| AI-2 Recommendation | `/api/ai/ai2/recommend` | `POST` | Authenticated |
| Create Booking | `/api/bookings` | `POST` | Authenticated (409 on conflict) |
| Process Payment | `/api/payments` | `POST` | Authenticated |
| Gate QR Scanner | `/api/check-in` | `POST` | ADMIN |
| AI-3 Predictions Report | `/api/admin/reports/predictions` | `GET` | ADMIN |
