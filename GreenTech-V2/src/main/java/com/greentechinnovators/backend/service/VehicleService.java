package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleResponseDTO;
import com.greentechinnovators.backend.entity.Vehicle;
import com.greentechinnovators.backend.entity.VehicleLog;
import com.greentechinnovators.backend.mapper.VehicleMapper;
import com.greentechinnovators.backend.repository.EnergyRepository;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.repository.VehicleRepository;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import com.greentechinnovators.backend.utils.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final VehicleMapper mapper;
    private final VehicleLogRepository vehicleLogRepository;
    private final CarbonFootprintService carbonService;

    public VehicleResponseDTO create(VehicleRequestDTO dto) {
        Vehicle vehicle = mapper.toVehicle(dto);
        Vehicle vehicle1 = vehicleRepository.save(vehicle);
        return mapper.toVehicleResponse(vehicle1);
    }

    public List<VehicleResponseDTO> all() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return vehicles.stream().map(mapper::toVehicleResponse).toList();
    }

    public VehicleResponseDTO findById(String id) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(() -> {
            throw new RuntimeException("Vehicle Not Found");
        });
        return mapper.toVehicleResponse(vehicle);
    }

    public void deleteById(String id) {
        vehicleRepository.deleteById(id);
    }

    public List<DailyDistanceDTO> getDistanceHistory(LocalDate start, LocalDate end) {
        List<DailyDistanceDTO> report = new ArrayList<>();

        // Loop from Start Date until End Date
        LocalDate current = start;
        while (!current.isAfter(end)) {

            // 1. Calculate distance for THIS specific day
            Double dailyKm = calculateDailyDistance(current);

            // 2. Calculate Carbon (Optional)
            Double dailyCarbon = carbonService.calculateTransportFootprint(dailyKm);

            // 3. Add to report
            report.add(DailyDistanceDTO.builder()
                    .date(current)
                    .totalDistanceKm(dailyKm)
                    .carbonFootprintKg(dailyCarbon)
                    .build());

            // Move to next day
            current = current.plusDays(1);
        }

        return report;
    }

    // --- HELPER: The Logic for a Single Day ---
    private Double calculateDailyDistance(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // Fetch logs sorted by time
        List<VehicleLog> logs = vehicleLogRepository.findByCreatedAtBetweenOrderByCreatedAtAsc(startOfDay, endOfDay);

        if (logs == null || logs.size() < 2) {
            return 0.0;
        }

        double totalDistance = 0.0;
        for (int i = 0; i < logs.size() - 1; i++) {
            VehicleLog p1 = logs.get(i);
            VehicleLog p2 = logs.get(i + 1);

            totalDistance += GeoUtils.calculateDistanceKm(
                    p1.getLatitude(), p1.getLongitude(),
                    p2.getLatitude(), p2.getLongitude()
            );
        }
        return totalDistance;
    }
}
