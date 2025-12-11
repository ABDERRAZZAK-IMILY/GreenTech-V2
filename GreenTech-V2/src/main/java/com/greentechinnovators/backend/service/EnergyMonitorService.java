package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyMonitorRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyMonitorResponseDTO;
import com.greentechinnovators.backend.entity.EnergyMonitor;
import com.greentechinnovators.backend.mapper.EnergyMapper;
import com.greentechinnovators.backend.repository.EnergyMonitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EnergyMonitorService {
    private final EnergyMonitorRepository energyMonitorRepository;
    private final EnergyMapper energyMapper;


    public EnergyMonitorResponseDTO create(EnergyMonitorRequestDTO dto) {
        EnergyMonitor energyMonitor = energyMonitorRepository.save(energyMapper.toEntity(dto));
        return energyMapper.toResponse(energyMonitor);
    }
    

}
