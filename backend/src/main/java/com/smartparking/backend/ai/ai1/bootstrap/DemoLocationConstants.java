package com.smartparking.backend.ai.ai1.bootstrap;

/**
 * Demo parking coordinates for college demonstrations.
 * Used by AI-1 bootstrap so seeded areas appear within the 500m nearby search.
 */
public final class DemoLocationConstants {

    private DemoLocationConstants() {
    }

    /** Primary demo search location (Area 1 — City Mall Main Lot). */
    public static final double DEMO_LATITUDE = 9.7553;
    public static final double DEMO_LONGITUDE = 76.6499;

    /** Legacy Bangalore coordinates from earlier bootstrap versions. */
    public static final double LEGACY_BANGALORE_LATITUDE = 12.9716;
    public static final double LEGACY_BANGALORE_LONGITUDE = 77.5946;

    private static final double LEGACY_TOLERANCE = 0.0001;

    public static double latitudeForAi1Area(long ai1AreaId) {
        return switch ((int) ai1AreaId) {
            case 1 -> 9.7553;
            case 2 -> 9.7565;
            case 3 -> 9.7542;
            default -> DEMO_LATITUDE;
        };
    }

    public static double longitudeForAi1Area(long ai1AreaId) {
        return switch ((int) ai1AreaId) {
            case 1 -> 76.6499;
            case 2 -> 76.6508;
            case 3 -> 76.6488;
            default -> DEMO_LONGITUDE;
        };
    }

    public static boolean isLegacyBangaloreCoordinate(double latitude, double longitude) {
        return Math.abs(latitude - LEGACY_BANGALORE_LATITUDE) < LEGACY_TOLERANCE
                && Math.abs(longitude - LEGACY_BANGALORE_LONGITUDE) < LEGACY_TOLERANCE;
    }
}
