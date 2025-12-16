package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.request.VehicleRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleResponseDTO;
import com.greentechinnovators.backend.entity.VehicleLog;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.service.VehicleLogService;
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
    private final VehicleLogService service;
    private final VehicleService VLservice;

    @PostMapping
    public ResponseEntity<VehicleLogResponseDTO> crate(@RequestBody VehicleLogRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
    @GetMapping()
    public ResponseEntity<VehicleResponseDTO> findByUserId(@RequestParam String userId)  {
        return ResponseEntity.ok(VLservice.findVehicleByUserId(userId));
    }
}
