package com.greentechinnovators.backend.service.report;

import com.greentechinnovators.backend.dto.ReportData;
import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.TrashService;
import com.greentechinnovators.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReportDataFetcher {

    private final EnergyService energyService;
    private final TrashService trashService;
    private final VehicleService vehicleService;

    // Facteur d'émission approx pour l'électricité (Maroc)
    private static final double KWH_TO_CO2_FACTOR = 0.58;

    public ReportData getMonthlyData(LocalDateTime start, LocalDateTime end) {
        // 1. Transport
        List<DailyDistanceDTO> logs = vehicleService.getDistanceHistory(start, end);
        if (logs == null) logs = new ArrayList<>();

        double transKm = logs.stream().mapToDouble(DailyDistanceDTO::getTotalDistanceKm).sum();
        double transCo2 = logs.stream().mapToDouble(DailyDistanceDTO::getCarbonFootprintKg).sum();

        // 2. Déchets
        List<DailyTrashDTO> waste = trashService.TrashCarbonFootprint(start, end);
        if (waste == null) waste = new ArrayList<>();

        double trashKg = waste.stream().mapToDouble(d -> d.getTotalWeightKg() > 0 ? d.getTotalWeightKg() : 0).sum();
        double trashCo2 = waste.stream().mapToDouble(d -> d.getCarbonFootprintKg() > 0 ? d.getCarbonFootprintKg() : 0).sum();

        // 3. Energie
        double energyKwh = 0.0;
        try {
            energyKwh = energyService.getConsumedKwhBetweenDates(start, end);
        } catch (Exception ignored) {}

        // ✅ Correction: Calcul CO2 spécifique à l'énergie
        double energyCo2 = energyKwh * KWH_TO_CO2_FACTOR;

        return ReportData.builder()
                .transportKm(transKm)
                .transportCo2(transCo2)
                .trashWeight(trashKg)
                .trashCo2(trashCo2)
                .energyKwh(energyKwh)
                .energyCo2(energyCo2)
                .build();
    }
}