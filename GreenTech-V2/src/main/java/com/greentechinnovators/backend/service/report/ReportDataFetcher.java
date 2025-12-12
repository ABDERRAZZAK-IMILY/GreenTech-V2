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

import static com.greentechinnovators.backend.utils.CarbonFootprintService.FACTOR_TRASH_MIXED;

@Component
@RequiredArgsConstructor
public class ReportDataFetcher {

    private final EnergyService energyService;
    private final TrashService trashService;
    private final VehicleService vehicleService;


    public ReportData getMonthlyData(LocalDateTime start, LocalDateTime end) {
        List<DailyDistanceDTO> logs = vehicleService.getDistanceHistory(start, end);
        if (logs == null) logs = new ArrayList<>();

        double transKm = logs.stream().mapToDouble(DailyDistanceDTO::getTotalDistanceKm).sum();
        double transCo2 = logs.stream().mapToDouble(DailyDistanceDTO::getCarbonFootprintKg).sum();

        List<DailyTrashDTO> waste = trashService.TrashCarbonFootprint(start, end);
        if (waste == null) waste = new ArrayList<>();

        double trashKg = waste.stream().mapToDouble(d -> d.getTotalWeightKg() > 0 ? d.getTotalWeightKg() : 0).sum();
        double trashCo2 = waste.stream().mapToDouble(d -> d.getCarbonFootprintKg() > 0 ? d.getCarbonFootprintKg() : 0).sum();

        double energyKwh = 0.0;
        try {
            energyKwh = energyService.getConsumedKwhBetweenDates(start, end);
        } catch (Exception ignored) {}

        double energyCo2 = energyKwh * FACTOR_TRASH_MIXED;

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