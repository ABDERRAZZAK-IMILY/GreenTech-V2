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
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public List<DailyDistanceDTO> getDistanceHistory(LocalDateTime start, LocalDateTime end) {

        List<VehicleLog> allLogs = vehicleLogRepository.findAll();

        List<DailyDistanceDTO> report = new ArrayList<>();
        LocalDateTime current = start;

        while (!current.isAfter(end)) {

            LocalDateTime dayStart = current.toLocalDate().atStartOfDay();
            LocalDateTime dayEnd = dayStart.plusDays(1);

            List<VehicleLog> dailyLogs = allLogs.stream()
                    .filter(log -> {
                        if (log.getCreatedAt() == null) return false;
                        return !log.getCreatedAt().isBefore(dayStart) &&
                                log.getCreatedAt().isBefore(dayEnd);
                    })
                    .collect(Collectors.toList());

            Map<String, List<VehicleLog>> logsPerCar = dailyLogs.stream()
                    .filter(log -> log.getVehicleId() != null)
                    .collect(Collectors.groupingBy(VehicleLog::getVehicleId));

            double totalFleetDistance = 0.0;

            for (List<VehicleLog> carLogs : logsPerCar.values()) {
                carLogs.sort(Comparator.comparing(VehicleLog::getCreatedAt));

                totalFleetDistance += calculateSingleCarDistance(carLogs);
            }

            report.add(DailyDistanceDTO.builder()
                    .date(current)
                    .totalDistanceKm(totalFleetDistance)
                    .carbonFootprintKg(totalFleetDistance * 0.12)
                    .build());

            current = current.plusDays(1);
        }
        return report;
    }

    // Helper Method
    private Double calculateSingleCarDistance(List<VehicleLog> logs) {
        if (logs.size() < 2) return 0.0;

        double dist = 0.0;
        for (int i = 0; i < logs.size() - 1; i++) {
            dist += GeoUtils.calculateDistanceKm(
                    logs.get(i).getLatitude(), logs.get(i).getLongitude(),
                    logs.get(i+1).getLatitude(), logs.get(i+1).getLongitude()
            );
        }
        return dist;
    }
}
