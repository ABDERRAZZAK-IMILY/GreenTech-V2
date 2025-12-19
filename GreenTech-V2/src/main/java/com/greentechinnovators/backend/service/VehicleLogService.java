package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.vehicle.TotalDistanceResponseDTO;
import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.entity.Vehicle;
import com.greentechinnovators.backend.entity.VehicleLog;
import com.greentechinnovators.backend.mapper.VehicleMapper;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.repository.VehicleRepository;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class VehicleLogService {
    private final VehicleRepository vehicleRepository;
    private final VehicleMapper mapper;
    private final VehicleLogRepository vehicleLogRepository;
    private final VehicleService vehicleService;

    public VehicleLogResponseDTO create(VehicleLogRequestDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId()).orElseThrow(() -> {
            throw new RuntimeException("vehicle not found");
        });
        VehicleLog vehicleLog = vehicleLogRepository.save(mapper.toVehicleLog(dto));
        vehicleLog = vehicleLogRepository.save(vehicleLog);

        vehicle.setLatitude(dto.getLatitude());
        vehicle.setLongitude(dto.getLongitude());

        if (vehicle.getVehicleLogs() == null) {
            vehicle.setVehicleLogs(new ArrayList<>());
        }
        vehicle.getVehicleLogs().add(vehicleLog);
        vehicleRepository.save(vehicle);
        vehicleRepository.save(vehicle);
        return mapper.toVehicleLogResponse(vehicleLog);
    }

    public List<VehicleLogResponseDTO> findAll() {
        List<VehicleLog> vehicleLogs = vehicleLogRepository.findAll();
        return vehicleLogs.stream().map(mapper::toVehicleLogResponse).toList();
    }

    public List<VehicleLogResponseDTO> getTodayReadings() {
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);

        List<VehicleLog> vehicleLogs = vehicleLogRepository.findAll().stream()
                .filter(v -> v.getCreatedAt() != null &&
                        !v.getCreatedAt().isBefore(startOfToday) &&
                        v.getCreatedAt().isBefore(endOfToday))
                .toList();

        return vehicleLogs.stream().map(mapper::toVehicleLogResponse).toList();
    }

    public void deleteById(String id) {
        vehicleLogRepository.deleteById(id);
    }

    public TotalDistanceResponseDTO calculateDistance(String id) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(()->{
            throw new RuntimeException("vehicle not found");
        });

        double totalDist = vehicleService.calculateSingleCarDistance(vehicle.getVehicleLogs()); // example result

        return TotalDistanceResponseDTO.builder()
                .id(id)
                .distance(totalDist)
                .build();
    }

}
