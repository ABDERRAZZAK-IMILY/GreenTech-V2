package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.mapper.TrashMapper;
import com.greentechinnovators.backend.repository.TrashRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrashService {

    private final TrashRepository repository;

    private  final TrashMapper mapper;

    public TrashResponseDTO saveReading(TrashRequestDTO dto) {

        Trash entity = mapper.toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        Trash savedEntity = repository.save(entity);
        return mapper.toResponse(savedEntity);


    }

    public List<TrashResponseDTO> getAllReadings() {
        List<Trash> trashList =  repository.findAllByOrderByTimestampDesc();

        return  trashList.stream().map(mapper::toResponse).toList();
    }
}