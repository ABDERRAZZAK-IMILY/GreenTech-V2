package com.greentechinnovators.backend.utils;

import org.springframework.stereotype.Service;

@Service
public class CarbonFootprintService {

    // 1. ENERGY: Morocco Grid (approx 0.73 kg/kWh due to coal/gas mix)
    private static final double FACTOR_ENERGY_GRID_MOROCCO = 0.73;

    // 2. GAS: Butane (LPG) - Common "Bota" is 12kg
    // Combustion of LPG is approx 2.99 kg CO2 per kg of gas
    private static final double FACTOR_GAS_LPG_PER_KG = 3.0;

    // 3. TRASH: Mixed Municipal Waste (Landfill)
    // Decomposing organic waste in landfills releases Methane. Approx 0.8 - 1.2 kg CO2e per kg waste
    public static final double FACTOR_TRASH_MIXED = 0.85;

    // 4. TRANSPORT: Average Car (Mixed Fleet)
    // Average fossil fuel car emits approx 0.17 - 0.22 kg/km
    private static final double FACTOR_TRANSPORT_AVG_CAR_PER_KM = 0.19;
    private static final double FACTOR_TRANSPORT_DIESEL_PER_LITER = 2.68;
    private static final double FACTOR_TRANSPORT_GASOLINE_PER_LITER = 2.31;

    /**
     * Calculate Carbon Footprint for Electricity
     *
     * @param kwhConsumed Electricity consumed in kWh
     * @return kg CO2e
     */
    public double calculateEnergyFootprint(Double kwhConsumed) {
        if (kwhConsumed == null || kwhConsumed < 0) return 0.0;
        return kwhConsumed * FACTOR_ENERGY_GRID_MOROCCO;
    }

    /**
     * Calculate Carbon Footprint for Gas (LPG/Butane)
     *
     * @param weightKg Weight of gas consumed in Kg (e.g., 12 for a full bottle)
     * @return kg CO2e
     */
    public double calculateGasFootprint(Double weightKg) {
        if (weightKg == null || weightKg < 0) return 0.0;
        return weightKg * FACTOR_GAS_LPG_PER_KG;
    }

    /**
     * Helper for "Bota" bottles (Standard 12kg or 3kg)
     */
    public double calculateGasFootprintByBottles(int smallBottles, int largeBottles) {
        double totalKg = (smallBottles * 3.0) + (largeBottles * 12.0);
        return calculateGasFootprint(totalKg);
    }

    /**
     * Calculate Carbon Footprint for Trash/Waste
     *
     * @param weightKg Weight of waste generated in Kg
     * @return kg CO2e
     */
    public double calculateTrashFootprint(Double weightKg) {
        if (weightKg == null || weightKg < 0) return 0.0;
        return weightKg * FACTOR_TRASH_MIXED;
    }

    /**
     * Calculate Carbon Footprint for Transport (Distance based)
     *
     * @param distanceKm Distance traveled in KM
     * @return kg CO2e
     */
    public double calculateTransportFootprint(Double distanceKm) {
        if (distanceKm == null || distanceKm < 0) return 0.0;
        return distanceKm * FACTOR_TRANSPORT_AVG_CAR_PER_KM;
    }

    /**
     * Calculate Carbon Footprint for Transport (Fuel based) - More Accurate
     *
     * @param liters   Liters of fuel consumed
     * @param isDiesel True if Diesel, False if Gasoline (Essence)
     * @return kg CO2e
     */
    public double calculateFuelFootprint(Double liters, boolean isDiesel) {
        if (liters == null || liters < 0) return 0.0;
        double factor = isDiesel ? FACTOR_TRANSPORT_DIESEL_PER_LITER : FACTOR_TRANSPORT_GASOLINE_PER_LITER;
        return liters * factor;
    }
}