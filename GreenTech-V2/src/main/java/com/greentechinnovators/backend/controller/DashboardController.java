package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.EnergyDtoRequest;
import com.greentechinnovators.backend.dto.EnergyDtoResponse;
import com.greentechinnovators.backend.dto.TrashDtoRequest;
import com.greentechinnovators.backend.dto.TrashDtoResponse;
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
    public EnergyDtoResponse ingestEnergyData(@RequestBody EnergyDtoRequest dto) {
        return energyService.createReading(dto);
    }

    @GetMapping("/energy/metrics")
    public List<EnergyDtoResponse> getEnergyMetrics() {
        return energyService.getAllReadings();
    }

    // Trash endpoints
    @PostMapping("/trash/ingest")
    public TrashDtoResponse ingestTrashData(@RequestBody TrashDtoRequest dto) {
        return trashService.saveReading(dto);
    }

    @GetMapping("/trash/metrics")
    public List<TrashDtoResponse> getTrashMetrics() {
        return trashService.getAllReadings();
    }
}