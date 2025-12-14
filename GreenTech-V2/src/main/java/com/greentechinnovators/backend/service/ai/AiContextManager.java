package com.greentechinnovators.backend.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.GasService;
import com.greentechinnovators.backend.service.TrashService;
import com.greentechinnovators.backend.service.VehicleService;
import com.greentechinnovators.backend.utils.AiDataHelper;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
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
    private final AiDataHelper helper;
    private final CarbonFootprintService carbonService;

    /**
     * Hada howa "le cerveau" li kayjma3 data mn ga3 les services.
     * Kayraja3 JSON String clean bach DeepSeek yfhamha.
     */
    public String getGlobalContextJson() {
        LocalDate today = LocalDate.now();

        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        Map<String, Object> context = new LinkedHashMap<>();

        context.put("TRANSPORT", getTransportData(startOfMonth, now, startOfLastMonth, endOfLastMonth));
        context.put("TRASH", getTrashData(startOfMonth, now, startOfLastMonth, endOfLastMonth));
        context.put("ENERGY", getEnergyData(startOfMonth, now, startOfLastMonth, endOfLastMonth));
        context.put("GAS", getGasData(startOfMonth, now, startOfLastMonth, endOfLastMonth));

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

            double currentDist = helper.calculateVehicleDistance(currentLogs);
            double lastDist = helper.calculateVehicleDistance(lastLogs);
            double currentCo2 = helper.calculateVehicleCarbon(currentLogs);
            double lastCo2 = helper.calculateVehicleCarbon(lastLogs);

            return Map.of(
                    "Distance_Current", String.format(Locale.US, "%.2f km", currentDist),
                    "Distance_LastMonth", String.format(Locale.US, "%.2f km", lastDist),
                    "CO2_Current", String.format(Locale.US, "%.2f kg", currentCo2),
                    "CO2_LastMonth", String.format(Locale.US, "%.2f kg", lastCo2),
                    "Trend_CO2", helper.getTrend(lastCo2, currentCo2)
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

            double currentWeight = helper.calculateTrashWeight(currentWaste);
            double currentCo2 = helper.calculateTrashCarbon(currentWaste);
            double lastCo2 = helper.calculateTrashCarbon(lastWaste);

            return Map.of(
                    "Total_Weight_Current", String.format(Locale.US, "%.2f kg", currentWeight),
                    "CO2_Current", String.format(Locale.US, "%.2f kg", currentCo2),
                    "CO2_LastMonth", String.format(Locale.US, "%.2f kg", lastCo2),
                    "Trend_CO2", helper.getTrend(lastCo2, currentCo2)
            );
        } catch (Exception e) {
            log.error("Erreur Trash Data", e);
            return Map.of("Status", "Données indisponibles");
        }
    }
    private Map<String, Object> getEnergyData(LocalDateTime start, LocalDateTime end, LocalDateTime lastStart, LocalDateTime lastEnd) {
        try {
            List<EnergyResponseDTO> currentList = energyService.getConsumedKwhBetweenDates(start, end);
            List<EnergyResponseDTO> lastList = energyService.getConsumedKwhBetweenDates(lastStart, lastEnd);

            double currentKwh = helper.calculateTotalEnergy(currentList);
            double lastKwh = helper.calculateTotalEnergy(lastList);

            double currentCo2 = carbonService.calculateEnergyFootprint(currentKwh);
            double lastCo2 = carbonService.calculateEnergyFootprint(lastKwh);

            return Map.of(
                    "Consumption_Current", String.format(Locale.US, "%.2f kWh", currentKwh),
                    "Consumption_LastMonth", String.format(Locale.US, "%.2f kWh", lastKwh),
                    "Trend_Consumption", helper.getTrend(lastKwh, currentKwh),
                    "CO2_Current", String.format(Locale.US, "%.2f kg", currentCo2),
                    "CO2_LastMonth", String.format(Locale.US, "%.2f kg", lastCo2),
                    "Trend_CO2", helper.getTrend(lastCo2, currentCo2)
            );
        } catch (Exception e) {
            log.warn("Erreur Energy Data: {}", e.getMessage());
            return Map.of("Status", "Données indisponibles");
        }
    }
    private Map<String, Object> getGasData(LocalDateTime start, LocalDateTime end, LocalDateTime lastStart, LocalDateTime lastEnd) {
        try {
            List<GasResponseDTO> currentList = gasService.getConsumedGasBetweenDates(start, end);
            List<GasResponseDTO> lastList = gasService.getConsumedGasBetweenDates(lastStart, lastEnd);

            double currentVal = helper.calculateTotalGas(currentList);
            double lastVal = helper.calculateTotalGas(lastList);

            double currentCo2 = carbonService.calculateGasFootprint(currentVal);
            double lastCo2 = carbonService.calculateGasFootprint(lastVal);

            return Map.of(
                    "Consumption_Current", String.format(Locale.US, "%.2f kg", currentVal),
                    "Consumption_LastMonth", String.format(Locale.US, "%.2f kg", lastVal),
                    "Trend_Gas", helper.getTrend(lastVal, currentVal),
                    "CO2_Current", String.format(Locale.US, "%.2f kg", currentCo2),
                    "CO2_LastMonth", String.format(Locale.US, "%.2f kg", lastCo2),
                    "Trend_CO2", helper.getTrend(lastCo2, currentCo2)
            );
        } catch (Exception e) {
            log.error("Erreur Gas Data", e);
            return Map.of("Status", "Non configurer");
        }
    }


    }