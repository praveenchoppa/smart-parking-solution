package com.smartparking.backend.common.util;

public final class GeoUtils {

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    private GeoUtils() {
    }

    public static double calculateDistanceMeters(
            double latitude1,
            double longitude1,
            double latitude2,
            double longitude2) {

        double deltaLatitude = Math.toRadians(latitude2 - latitude1);
        double deltaLongitude = Math.toRadians(longitude2 - longitude1);

        double a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2)
                + Math.cos(Math.toRadians(latitude1)) * Math.cos(Math.toRadians(latitude2))
                * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
