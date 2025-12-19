package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleResponseDTO;
import com.greentechinnovators.backend.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("api/vehicle")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    @PostMapping("/add")
    public ResponseEntity<VehicleResponseDTO> save(@Valid @RequestBody VehicleRequestDTO dto) {
        return ResponseEntity.ok(vehicleService.create(dto));
    }
    @GetMapping("/all")
    public ResponseEntity<List<VehicleResponseDTO>> all() {
        return ResponseEntity.ok(vehicleService.all());
    }
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(vehicleService.findById(id));
    }
    @DeleteMapping("delete/{id}")
    public void DeleteById(@PathVariable String id) {
        vehicleService.deleteById(id);
    }
    @GetMapping("/total/distance/today")
    public ResponseEntity<?> today() {
        Double totalDistance = vehicleService.TotalDistanceTraveledToday();
        HashMap<String, Object> map = new HashMap<>();
        map.put("totalDistance", totalDistance);
        return ResponseEntity.ok(map);
    }
}
