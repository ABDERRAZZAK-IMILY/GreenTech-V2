package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyMonitorRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyMonitorResponseDTO;
import com.greentechinnovators.backend.entity.EnergyMonitor;
import com.greentechinnovators.backend.service.EnergyMonitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
@RequestMapping("api/v1/energy/monitor")
public class EnergyMonitorController {
    private final EnergyMonitorService service;

    public ResponseEntity<EnergyMonitorResponseDTO> getEnergyMonitor(@Valid @RequestBody EnergyMonitorRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
}
