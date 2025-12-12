package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.TrashService;
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
}