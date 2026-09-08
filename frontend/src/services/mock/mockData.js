// Single, central shared mock data repository for both Admin and User services.
// Modifications in Admin immediately reflect in User pages.

export const INITIAL_MOCK_PARKING_AREAS = [
  {
    id: 1,
    name: "TechHub Central Garage",
    address: "123 Innovation Way, Tech Park, Block A",
    latitude: 12.9716,
    longitude: 77.5946,
    distance: 0.2,
    hourlyRate: 40,
    totalSlots: 20,
    availableSlots: 14,
    occupiedSlots: 6,
    occupancyPercentage: 30,
    recommendationAvailable: true,
    recommendationScore: 0.94,
    recommendationReason: "Optimal proximity & high slot availability right now"
  },
  {
    id: 2,
    name: "Metro Plaza Multi-Level Parking",
    address: "45 MG Road, Near Central Metro Station",
    latitude: 12.9750,
    longitude: 77.6000,
    distance: 0.4,
    hourlyRate: 50,
    totalSlots: 30,
    availableSlots: 8,
    occupiedSlots: 22,
    occupancyPercentage: 73,
    recommendationAvailable: true,
    recommendationScore: 0.78,
    recommendationReason: "Covered security parking near shopping hub"
  },
  {
    id: 3,
    name: "City Square Underground Deck",
    address: "78 Commercial Street, City Center",
    latitude: 12.9800,
    longitude: 77.5900,
    distance: 0.5,
    hourlyRate: 60,
    totalSlots: 16,
    availableSlots: 2,
    occupiedSlots: 14,
    occupancyPercentage: 88,
    recommendationAvailable: false
  }
];

export const INITIAL_MOCK_SLOTS = {
  1: [
    { slotId: 101, slotNumber: "A-01", status: "AVAILABLE" },
    { slotId: 102, slotNumber: "A-02", status: "AVAILABLE" },
    { slotId: 103, slotNumber: "A-03", status: "OCCUPIED" },
    { slotId: 104, slotNumber: "A-04", status: "RESERVED" },
    { slotId: 105, slotNumber: "A-05", status: "AVAILABLE" },
    { slotId: 106, slotNumber: "B-01", status: "AVAILABLE" },
    { slotId: 107, slotNumber: "B-02", status: "OCCUPIED" },
    { slotId: 108, slotNumber: "B-03", status: "AVAILABLE" },
    { slotId: 109, slotNumber: "B-04", status: "AVAILABLE" },
    { slotId: 110, slotNumber: "B-05", status: "OCCUPIED" }
  ],
  2: [
    { slotId: 201, slotNumber: "P1-01", status: "AVAILABLE" },
    { slotId: 202, slotNumber: "P1-02", status: "OCCUPIED" },
    { slotId: 203, slotNumber: "P1-03", status: "OCCUPIED" },
    { slotId: 204, slotNumber: "P1-04", status: "AVAILABLE" },
    { slotId: 205, slotNumber: "P2-01", status: "RESERVED" }
  ],
  3: [
    { slotId: 301, slotNumber: "UG-01", status: "OCCUPIED" },
    { slotId: 302, slotNumber: "UG-02", status: "AVAILABLE" },
    { slotId: 303, slotNumber: "UG-03", status: "OCCUPIED" }
  ]
};

export const INITIAL_MOCK_VEHICLES = [
  { id: 1, vehicleNumber: "KL05AB1234", vehicleType: "CAR" },
  { id: 2, vehicleNumber: "KL05XY5678", vehicleType: "SUV" }
];

export const INITIAL_MOCK_BOOKINGS = [
  {
    id: 101,
    bookingCode: "BK101-A1F9",
    parkingAreaId: 1,
    parkingAreaName: "TechHub Central Garage",
    parkingAddress: "123 Innovation Way, Tech Park, Block A",
    parkingSlotId: 101,
    slotNumber: "A-01",
    vehicleId: 1,
    vehicleNumber: "KL05AB1234",
    vehicleType: "CAR",
    durationHours: 2,
    hourlyRate: 40,
    totalAmount: 80.00,
    status: "PENDING_CHECK_IN",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    checkInTime: null,
    completedTime: null
  },
  {
    id: 99,
    bookingCode: "BK099-Z4K2",
    parkingAreaId: 2,
    parkingAreaName: "Metro Plaza Multi-Level Parking",
    parkingAddress: "45 MG Road, Near Central Metro Station",
    parkingSlotId: 202,
    slotNumber: "P1-02",
    vehicleId: 2,
    vehicleNumber: "KL05XY5678",
    vehicleType: "SUV",
    durationHours: 1,
    hourlyRate: 50,
    totalAmount: 50.00,
    status: "COMPLETED",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    checkInTime: new Date(Date.now() - 82800000).toISOString(),
    completedTime: new Date(Date.now() - 79200000).toISOString()
  }
];

export const INITIAL_AI3_PREDICTIONS = {
  currentOccupancyRate: 60,
  peakExpectedTime: "05:00 PM",
  peakExpectedOccupancy: 91,
  hourlyPredictions: [
    { time: "01:00 PM", occupancyPercentage: 62 },
    { time: "02:00 PM", occupancyPercentage: 72 },
    { time: "03:00 PM", occupancyPercentage: 78 },
    { time: "04:00 PM", occupancyPercentage: 85 },
    { time: "05:00 PM", occupancyPercentage: 91 },
    { time: "06:00 PM", occupancyPercentage: 88 },
    { time: "07:00 PM", occupancyPercentage: 75 }
  ]
};

// Singleton In-Memory Repository Shared Across All Services
export const sharedMockRepository = {
  parkingAreas: [...INITIAL_MOCK_PARKING_AREAS],
  slots: JSON.parse(JSON.stringify(INITIAL_MOCK_SLOTS)),
  vehicles: [...INITIAL_MOCK_VEHICLES],
  bookings: [...INITIAL_MOCK_BOOKINGS]
};
