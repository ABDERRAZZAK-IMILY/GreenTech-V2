package com.greentechinnovators.backend.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.GasService;
import com.greentechinnovators.backend.service.TrashService;
import com.greentechinnovators.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiContextManager {

    private final EnergyService energyService;
    private final GasService gasService;
    private final TrashService trashService;
    private final VehicleService vehicleService;
    private final ObjectMapper objectMapper;

    /**
     * Hada howa "le cerveau" li kayjma3 data mn ga3 les services.
     * Kayraja3 JSON String clean bach DeepSeek yfhamha.
     */
    public String getGlobalContextJson() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1);

        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusDays(1);

        Map<String, Object> context = new LinkedHashMap<>();

        context.put("TRANSPORT", getTransportData(startOfMonth, now, startOfLastMonth, endOfLastMonth));
        context.put("TRASH", getTrashData(startOfMonth, now, startOfLastMonth, endOfLastMonth));
        context.put("ENERGY", getEnergyData(startOfMonth, now, startOfLastMonth, endOfLastMonth));
        //context.put("GAS", getGasData(startOfMonth, now));

        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);
        } catch (JsonProcessingException e) {
            log.error("Erreur f serialisation JSON context", e);
            return "{}";
        }
    }


    private Map<String, Object> getTransportData(LocalDateTime start, LocalDateTime end, LocalDateTime lastStart, LocalDateTime lastEnd) {
        try {
            List<DailyDistanceDTO> currentLogs = vehicleService.getDistanceHistory(start, end);
            List<DailyDistanceDTO> lastLogs = vehicleService.getDistanceHistory(lastStart, lastEnd);

            double currentDist = calculateVehicleDistance(currentLogs);
            double lastDist = calculateVehicleDistance(lastLogs);
            double currentCo2 = calculateVehicleCarbon(currentLogs);
            double lastCo2 = calculateVehicleCarbon(lastLogs);

            return Map.of(
                    "Distance_Current", String.format("%.2f km", currentDist),
                    "Distance_LastMonth", String.format("%.2f km", lastDist),
                    "CO2_Current", String.format("%.2f kg", currentCo2),
                    "CO2_LastMonth", String.format("%.2f kg", lastCo2),
                    "Trend_CO2", getTrend(lastCo2, currentCo2)
            );
        } catch (Exception e) {
            log.error("Erreur Transport Data", e);
            return Map.of("Status", "Données indisponibles");
        }
    }


    private Map<String, Object> getTrashData(LocalDateTime start, LocalDateTime end, LocalDateTime lastStart, LocalDateTime lastEnd) {
        try {
            List<DailyTrashDTO> currentWaste = trashService.TrashCarbonFootprint(start, end);
            List<DailyTrashDTO> lastWaste = trashService.TrashCarbonFootprint(lastStart, lastEnd);

            double currentWeight = calculateTrashWeight(currentWaste);
            double currentCo2 = calculateTrashCarbon(currentWaste);
            double lastCo2 = calculateTrashCarbon(lastWaste);

            return Map.of(
                    "Total_Weight_Current", String.format("%.2f kg", currentWeight),
                    "CO2_Current", String.format("%.2f kg", currentCo2),
                    "CO2_LastMonth", String.format("%.2f kg", lastCo2),
                    "Trend_CO2", getTrend(lastCo2, currentCo2)
            );
        } catch (Exception e) {
            log.error("Erreur Trash Data", e);
            return Map.of("Status", "Données indisponibles");
        }
    }


    private Map<String, Object> getEnergyData(LocalDateTime start, LocalDateTime end, LocalDateTime lastStart, LocalDateTime lastEnd) {
        try {
            double currentKwh = energyService.getConsumedKwhBetweenDates(start, end);
            double lastKwh = energyService.getConsumedKwhBetweenDates(lastStart, lastEnd);

            return Map.of(
                    "Consumption_Current", String.format("%.2f kWh", currentKwh),
                    "Consumption_LastMonth", String.format("%.2f kWh", lastKwh),
                    "Trend", getTrend(lastKwh, currentKwh)
            );
        } catch (Exception e) {
            log.warn("Erreur Energy Data: {}", e.getMessage());
            return Map.of("Status", "Données indisponibles");
        }
    }


//    private Map<String, Object> getGasData(LocalDateTime start, LocalDateTime end) {
//        try {
//            List<GasResponseDTO> currentGas = gasService.getTodayReadings();
//            return Map.of("Consumption_Current", String.format("%.2f units", currentGas));
//        } catch (Exception e) {
//            return Map.of("Status", "Non configurer");
//        }
//    }



    private String getTrend(double lastValue, double currentValue) {
        if (lastValue == 0) return "N/A";
        double diff = currentValue - lastValue;
        double percent = (diff / lastValue) * 100;

        if (percent > 0) return String.format("📈 +%.1f%% (Hausse)", percent);
        if (percent < 0) return String.format("📉 %.1f%% (Baisse)", percent);
        return "Stable";
    }

    private double calculateVehicleDistance(List<DailyDistanceDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream().mapToDouble(DailyDistanceDTO::getTotalDistanceKm).sum();
    }

    private double calculateVehicleCarbon(List<DailyDistanceDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream().mapToDouble(DailyDistanceDTO::getCarbonFootprintKg).sum();
    }

    private double calculateTrashWeight(List<DailyTrashDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream().mapToDouble(dto -> dto.getTotalWeightKg() > 0 ? dto.getTotalWeightKg() : 0.0).sum();
    }

    private double calculateTrashCarbon(List<DailyTrashDTO> logs) {
        if (logs == null || logs.isEmpty()) return 0.0;
        return logs.stream().mapToDouble(dto -> dto.getCarbonFootprintKg() > 0 ? dto.getCarbonFootprintKg() : 0.0).sum();
    }
}