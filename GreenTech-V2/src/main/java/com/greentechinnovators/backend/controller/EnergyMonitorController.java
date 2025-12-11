package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyMonitorRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyMonitorResponseDTO;
import com.greentechinnovators.backend.dto.StatusChangeDTO;
import com.greentechinnovators.backend.entity.EnergyMonitor;
import com.greentechinnovators.backend.service.EnergyMonitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
@RequestMapping("api/v1/energy/monitor")
public class EnergyMonitorController {
    private final EnergyMonitorService service;

    @PostMapping("/create")
    public ResponseEntity<EnergyMonitorResponseDTO> create(@Valid @RequestBody EnergyMonitorRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
    @PatchMapping("/update/{id}")
    public ResponseEntity<EnergyMonitorResponseDTO>  update(@Valid @RequestBody StatusChangeDTO dto, @PathVariable String id) {
        return ResponseEntity.ok(service.Update(dto, id));
    }
}
