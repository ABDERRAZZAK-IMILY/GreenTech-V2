package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.SmartDataDto;
import com.greentechinnovators.backend.service.SmartDataService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final SmartDataService service;

    public DashboardController(SmartDataService service) {
        this.service = service;
    }

    @PostMapping("/ingest")
    public SmartDataDto ingestData(@RequestBody SmartDataDto dto) {
        return service.saveReading(dto);
    }

    @GetMapping("/metrics/{type}")
    public List<SmartDataDto> getMetrics(@PathVariable String type) {
        return service.getReadingsByType(type.toUpperCase());
    }
}