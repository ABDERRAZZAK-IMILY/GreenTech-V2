package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.request.VehicleRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.entity.VehicleLog;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.service.VehicleLogservice;
import com.greentechinnovators.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

//just for test
@RestController
@RequestMapping("api/transport")
@RequiredArgsConstructor
public class TransportController {
    private final VehicleLogservice service;
    private final VehicleService VLservice;

    @PostMapping
    public ResponseEntity<VehicleLogResponseDTO> crate(@RequestBody VehicleLogRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
    @GetMapping("test")
    public ResponseEntity<List<DailyDistanceDTO>> test() {
        return ResponseEntity.ok(VLservice.getDistanceHistory(LocalDateTime.parse("2025-12-12T11:29:40.3526666"),LocalDateTime.parse("2025-12-12T14:56:52.8142666")));
    }
}
