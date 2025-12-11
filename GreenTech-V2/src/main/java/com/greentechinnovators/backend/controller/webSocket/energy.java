package com.greentechinnovators.backend.controller.webSocket;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.service.EnergyService;
import jakarta.servlet.ServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Controller("energy")
@RequiredArgsConstructor
public class energy {
    private final EnergyService energyService;

    @PostMapping("/add")
    @SendTo("topic")
    public ResponseEntity<EnergyResponseDTO> addEnergy(@RequestBody EnergyRequestDTO dto) {
        return ResponseEntity.ok(energyService.createReading(dto));
    }
    public ResponseEntity<List<EnergyResponseDTO>> allEnergy() {
        return ResponseEntity.ok(energyService.getAllReadings());
    }
}
