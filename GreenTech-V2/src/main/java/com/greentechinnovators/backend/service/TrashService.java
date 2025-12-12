package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.entity.Energy;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.entity.TrashMonitor;
import com.greentechinnovators.backend.mapper.TrashMapper;
import com.greentechinnovators.backend.repository.TrashMonitorRepository;
import com.greentechinnovators.backend.repository.TrashRepository;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrashService {

    private final TrashRepository repository;
    private final TrashMonitorRepository trashMonitorRepository;
    private final CarbonFootprintService carbonFootprintService;

    private final TrashMapper mapper;

    public TrashResponseDTO saveReading(TrashRequestDTO dto) {

        TrashMonitor monitor = trashMonitorRepository.findByMacAddress(dto.getMacAddress()).orElseThrow(() -> {
            throw new RuntimeException("Mac address not found");
        });
        Trash entity = mapper.toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        Trash savedEntity = repository.save(entity);
        monitor.getTrash().add(savedEntity);
        trashMonitorRepository.save(monitor);
        return mapper.toResponse(savedEntity);


    }

    public List<TrashResponseDTO> getAllReadings() {
        List<Trash> trashList = repository.findAll();

        return trashList.stream().map(mapper::toResponse).toList();
    }


    public Double getConsumeTrashBetweenDates(LocalDateTime start, LocalDateTime end) {

        List<Trash> allTrash = repository.findAll();

        Double consumedTrash = allTrash.stream()
                .filter(t -> {
                    if (t.getCreatedAt() == null || t.getWight() == null) return false;

                    boolean isAfterStart = !t.getCreatedAt().isBefore(start);
                    boolean isBeforeEnd = !t.getCreatedAt().isAfter(end);

                    return isAfterStart && isBeforeEnd;
                })
                .mapToDouble(Trash::getWight)
                .sum();


        return consumedTrash;
    }
}