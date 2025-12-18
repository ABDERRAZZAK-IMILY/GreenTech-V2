package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.gas.request.GasRequestDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.entity.Gas;
import com.greentechinnovators.backend.mapper.GasMapper;
import com.greentechinnovators.backend.repository.GasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GasService {
    private final GasRepository gasRepository;
    private final GasMapper gasMapper;
    private final com.greentechinnovators.backend.utils.CarbonFootprintService carbonFootprintService;

    public List<com.greentechinnovators.backend.dto.gas.responce.DailyGasDTO> getDailyGas(LocalDateTime start,
            LocalDateTime end) {
        List<Gas> allGas = gasRepository.findAll();
        java.util.List<com.greentechinnovators.backend.dto.gas.responce.DailyGasDTO> report = new java.util.ArrayList<>();
        LocalDateTime current = start;

        while (!current.isAfter(end)) {
            LocalDateTime startOfDay = current.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            double totalGas = allGas.stream()
                    .filter(g -> g.getCreatedAt() != null &&
                            !g.getCreatedAt().isBefore(startOfDay) &&
                            g.getCreatedAt().isBefore(endOfDay))
                    .mapToDouble(Gas::getConsumedGas)
                    .sum();

            double carbonFootprint = carbonFootprintService.calculateGasFootprint(totalGas);

            report.add(com.greentechinnovators.backend.dto.gas.responce.DailyGasDTO.builder()
                    .date(current)
                    .totalGasConsumed(totalGas)
                    .carbonFootprintKg(carbonFootprint)
                    .build());

            current = current.plusDays(1);
        }
        return report;
    }

    public GasResponseDTO create(GasRequestDTO dto) {
        Gas gas = gasMapper.toEntity(dto);
        Gas savedGas = gasRepository.save(gas);
        return gasMapper.toResponse(savedGas);
    }

    public List<GasResponseDTO> getAllReadings() {
        List<Gas> gasList = gasRepository.findAll();
        return gasList.stream().map(gasMapper::toResponse).toList();
    }

    public List<GasResponseDTO> getTodayReadings() {
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);

        List<Gas> gasList = gasRepository.findAll().stream()
                .filter(g -> g.getCreatedAt() != null &&
                        !g.getCreatedAt().isBefore(startOfToday) &&
                        g.getCreatedAt().isBefore(endOfToday))
                .toList();

        return gasList.stream().map(gasMapper::toResponse).toList();
    }

    public List<GasResponseDTO> getConsumedGasBetweenDates(LocalDateTime start, LocalDateTime end) {

        List<Gas> allGas = gasRepository.findAll();

        return allGas.stream()
                .filter(g -> {
                    if (g.getCreatedAt() == null)
                        return false;

                    boolean isAfterStart = !g.getCreatedAt().isBefore(start);
                    boolean isBeforeEnd = !g.getCreatedAt().isAfter(end);

                    return isAfterStart && isBeforeEnd;
                })
                .map(g -> GasResponseDTO.builder()
                        .id(g.getId().toString())
                        .consumedGas(g.getConsumedGas())
                        .createdAt(g.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
