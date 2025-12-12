package com.greentechinnovators.backend.utils;

public class GeoUtils {
    private static final int EARTH_RADIUS_KM = 6371; // Radius of the earth in km

    /**
     * Calculate distance between two points in latitude and longitude.
     * * @param lat1 Latitude of start point
     * @param lon1 Longitude of start point
     * @param lat2 Latitude of destination
     * @param lon2 Longitude of destination
     * @return Distance in Kilometers
     */
    public static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {

        // 1. Convert degrees to radians
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        // 2. Haversine Formula
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // 3. Calculate the result
        return EARTH_RADIUS_KM * c;
    }
}
