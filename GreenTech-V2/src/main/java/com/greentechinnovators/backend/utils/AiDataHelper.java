package com.greentechinnovators.backend.utils;

import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
public class AiDataHelper {

    public String getTrend(double lastValue, double currentValue) {
        if (lastValue == 0) return "N/A";
        double diff = currentValue - lastValue;
        double percent = (diff / lastValue) * 100;

        if (percent > 0) return String.format(Locale.US, "📈 +%.1f%% (Hausse)", percent);
        if (percent < 0) return String.format(Locale.US, "📉 %.1f%% (Baisse)", percent);
        return "Stable";
    }


    public double calculateVehicleDistance(List<DailyDistanceDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream().mapToDouble(DailyDistanceDTO::getTotalDistanceKm).sum();
    }

    public double calculateVehicleCarbon(List<DailyDistanceDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream().mapToDouble(DailyDistanceDTO::getCarbonFootprintKg).sum();
    }


    public double calculateTrashWeight(List<DailyTrashDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream()
                .mapToDouble(dto -> dto.getTotalWeightKg() != null ? dto.getTotalWeightKg() : 0.0)
                .sum();
    }

    public double calculateTrashCarbon(List<DailyTrashDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream()
                .mapToDouble(dto -> dto.getCarbonFootprintKg() != null ? dto.getCarbonFootprintKg() : 0.0)
                .sum();
    }


    public double calculateTotalEnergy(List<EnergyResponseDTO> list) {
        if (list == null || list.isEmpty()) return 0.0;
        return list.stream()
                .mapToDouble(EnergyResponseDTO::getEnergyConsumed)
                .sum();
    }

    public double calculateTotalGas(List<GasResponseDTO> list) {
        if (list == null || list.isEmpty()) return 0.0;
        return list.stream()
                .mapToDouble(GasResponseDTO::getConsumedGas)
                .sum();
    }
}