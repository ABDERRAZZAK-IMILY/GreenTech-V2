package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.entity.Vehicle;
import com.greentechinnovators.backend.entity.VehicleLog;
import com.greentechinnovators.backend.mapper.VehicleMapper;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class VehicleLogservice {
    private final VehicleRepository vehicleRepository;
    private final VehicleMapper mapper;
    private final VehicleLogRepository vehicleLogRepository;

    public VehicleLogResponseDTO create(VehicleLogRequestDTO dto){
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId()).orElseThrow(()->{throw  new RuntimeException("vehicle not found");});
        VehicleLog vehicleLog= vehicleLogRepository.save(mapper.toVehicleLog(dto));
        vehicleLog = vehicleLogRepository.save(vehicleLog);
        vehicle.getVehicleLogs().add(vehicleLog);
        vehicleRepository.save(vehicle);
        return mapper.toVehicleLogResponse(vehicleLog);
    }
    public List<VehicleLogResponseDTO> findAll(){
        List<VehicleLog> vehicleLogs = vehicleLogRepository.findAll();
        return vehicleLogs.stream().map(mapper::toVehicleLogResponse).toList();
    }
    public void deleteById(String id){
        vehicleLogRepository.deleteById(id);
    }

}
