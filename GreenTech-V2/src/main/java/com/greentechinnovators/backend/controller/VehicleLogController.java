package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.service.VehicleLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/vehicle/log")
@RequiredArgsConstructor
public class VehicleLogController {
    private final VehicleLogService vehicleLogService;
    @PostMapping
    public ResponseEntity<VehicleLogResponseDTO> create(@RequestBody VehicleLogRequestDTO dto){
        return ResponseEntity.ok(vehicleLogService.create(dto));
    }
}
