package com.greentechinnovators.backend.controller.webSocket;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.TrashService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Component
@RequiredArgsConstructor
@CrossOrigin("*")
public class trash {
    private final TrashService TrashService;

    @PostMapping("/add")
    @SendTo("topic")
    public ResponseEntity<TrashResponseDTO> addEnergy(@RequestBody TrashRequestDTO dto) {
        return ResponseEntity.ok(TrashService.saveReading(dto));
    }
    @GetMapping
    @SendTo("topic")
    public ResponseEntity<List<TrashResponseDTO>> allEnergy() {
        return ResponseEntity.ok(TrashService.getAllReadings());
    }
}
