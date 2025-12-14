package com.greentechinnovators.backend.service.report;

import com.greentechinnovators.backend.dto.ReportData;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO; // ✅ Import Gas DTO
import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.GasService; // ✅ Import Gas Service
import com.greentechinnovators.backend.service.TrashService;
import com.greentechinnovators.backend.service.VehicleService;
import com.greentechinnovators.backend.utils.AiDataHelper;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReportDataFetcher {

    private final EnergyService energyService;
    private final TrashService trashService;
    private final VehicleService vehicleService;
    private final GasService gasService;

    private final CarbonFootprintService carbonService;
    private final AiDataHelper helper;

    public ReportData getMonthlyData(LocalDateTime start, LocalDateTime end) {

        List<DailyDistanceDTO> logs = Collections.emptyList();
        try {
            logs = vehicleService.getDistanceHistory(start, end);
        } catch (Exception e) {
            log.error("Erreur fetching Transport data", e);
        }
        double transKm = helper.calculateVehicleDistance(logs);
        double transCo2 = helper.calculateVehicleCarbon(logs);


        List<DailyTrashDTO> waste = Collections.emptyList();
        try {
            waste = trashService.TrashCarbonFootprint(start, end);
        } catch (Exception e) {
            log.error("Erreur fetching Trash data", e);
        }
        double trashKg = helper.calculateTrashWeight(waste);
        double trashCo2 = helper.calculateTrashCarbon(waste);


        List<EnergyResponseDTO> energyList = Collections.emptyList();
        try {
            energyList = energyService.getConsumedKwhBetweenDates(start, end);
        } catch (Exception e) {
            log.error("Erreur fetching Energy data", e);
        }
        double energyKwh = helper.calculateTotalEnergy(energyList);
        double energyCo2 = carbonService.calculateEnergyFootprint(energyKwh);


        List<GasResponseDTO> gasList = Collections.emptyList();
        try {
            gasList = gasService.getConsumedGasBetweenDates(start, end);
        } catch (Exception e) {
            log.error("Erreur fetching Gas data", e);
        }
        double gasKg = helper.calculateTotalGas(gasList);
        double gasCo2 = carbonService.calculateGasFootprint(gasKg);


        return ReportData.builder()
                .transportKm(transKm)
                .transportCo2(transCo2)
                .trashWeight(trashKg)
                .trashCo2(trashCo2)
                .energyKwh(energyKwh)
                .energyCo2(energyCo2)
                .gasWeight(gasKg)
                .gasCo2(gasCo2)
                .build();
    }
}