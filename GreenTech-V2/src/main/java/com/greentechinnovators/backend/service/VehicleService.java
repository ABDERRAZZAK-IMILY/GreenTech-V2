package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleResponseDTO;
import com.greentechinnovators.backend.entity.Vehicle;
import com.greentechinnovators.backend.mapper.VehicleMapper;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final VehicleMapper mapper;
    private final VehicleLogRepository vehicleLogRepository;

    public VehicleResponseDTO create(VehicleRequestDTO dto) {
        Vehicle vehicle = mapper.toVehicle(dto);
        Vehicle vehicle1 = vehicleRepository.save(vehicle);
        return mapper.toVehicleResponse(vehicle1);
    }
    public List<VehicleResponseDTO> all() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return  vehicles.stream().map(mapper::toVehicleResponse).toList();
    }
    public VehicleResponseDTO findById(String id) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(()->{throw new RuntimeException( "Vehicle Not Found" );});
        return mapper.toVehicleResponse(vehicle);
    }
    public void deleteById(String id) {
        vehicleRepository.deleteById(id);
    }
}
