package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.StatusChangeDTO;
import com.greentechinnovators.backend.dto.trash.request.TrashMonitorRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashMonitorResponseDTO;
import com.greentechinnovators.backend.service.TrashMonitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("api/trash/monitor")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrashMonitorController {
    private final TrashMonitorService trashMonitorService;

    @PostMapping()
    private ResponseEntity<TrashMonitorResponseDTO> create(@Valid @RequestBody TrashMonitorRequestDTO dto) {
        return ResponseEntity.ok().body(trashMonitorService.create(dto));
    }

    @PatchMapping("{id}")
    private ResponseEntity<TrashMonitorResponseDTO> update(@Valid @RequestBody StatusChangeDTO dto, @PathVariable String id) {
        return ResponseEntity.ok().body(trashMonitorService.Update(dto, id));
    }
    @GetMapping("/all")
    private ResponseEntity<List<TrashMonitorResponseDTO>>  findAll() {
        return ResponseEntity.ok().body(trashMonitorService.findAll());
    }
}
