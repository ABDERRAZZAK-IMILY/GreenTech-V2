package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.request.VehicleRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.entity.VehicleLog;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.service.VehicleLogservice;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//just for test
@RestController
@RequestMapping("api/transport")
@RequiredArgsConstructor
public class TransportController {
    private final VehicleLogservice service;

    @PostMapping
    public ResponseEntity<VehicleLogResponseDTO> crate(@RequestBody VehicleLogRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
}
