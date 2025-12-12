package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.dto.gas.request.GasRequestDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.GasService;
import com.greentechinnovators.backend.service.TrashService;
import com.greentechinnovators.backend.service.VehicleLogservice;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final EnergyService energyService;
    private final TrashService trashService;
    private final GasService gasService;
    private final VehicleLogservice vehicleLogservice;

    // Energy endpoints
    @PostMapping("/energy/ingest")
    public EnergyResponseDTO ingestEnergyData(@RequestBody EnergyRequestDTO dto) {
        return energyService.createReading(dto);
    }

    @GetMapping("/energy/metrics")
    public List<EnergyResponseDTO> getEnergyMetrics() {
        return energyService.getAllReadings();
    }

    @GetMapping("/energy/today")
    public List<EnergyResponseDTO> getTodayEnergyMetrics() {
        return energyService.getTodayReadings();
    }

    // Trash endpoints
    @PostMapping("/trash/ingest")
    public TrashResponseDTO ingestTrashData(@RequestBody TrashRequestDTO dto) {
        return trashService.saveReading(dto);
    }

    @GetMapping("/trash/metrics")
    public List<TrashResponseDTO> getTrashMetrics() {
        return trashService.getAllReadings();
    }

    @GetMapping("/trash/today")
    public List<TrashResponseDTO> getTodayTrashMetrics() {
        return trashService.getTodayReadings();
    }

    // Gas endpoints
    @PostMapping("/gas/ingest")
    public GasResponseDTO ingestGasData(@Valid @RequestBody GasRequestDTO dto) {
        return gasService.create(dto);
    }

    @GetMapping("/gas/metrics")
    public List<GasResponseDTO> getGasMetrics() {
        return gasService.getAllReadings();
    }

    @GetMapping("/gas/today")
    public List<GasResponseDTO> getTodayGasMetrics() {
        return gasService.getTodayReadings();
    }

    // Vehicle/Transport endpoints
    @PostMapping("/vehicle/ingest")
    public VehicleLogResponseDTO ingestVehicleData(@Valid @RequestBody VehicleLogRequestDTO dto) {
        return vehicleLogservice.create(dto);
    }

    @GetMapping("/vehicle/metrics")
    public List<VehicleLogResponseDTO> getVehicleMetrics() {
        return vehicleLogservice.findAll();
    }

    @GetMapping("/vehicle/today")
    public List<VehicleLogResponseDTO> getTodayVehicleMetrics() {
        return vehicleLogservice.getTodayReadings();
    }
}