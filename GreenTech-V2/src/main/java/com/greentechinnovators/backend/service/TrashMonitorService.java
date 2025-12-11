package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.trash.request.TrashMonitorRequestDTO;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashMonitorResponseDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.entity.TrashMonitor;
import com.greentechinnovators.backend.mapper.TrashMapper;
import com.greentechinnovators.backend.repository.TrashMonitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TrashMonitorService {
    private final TrashMonitorRepository trashMonitorRepository;
    private final TrashMapper trashMapper;

    public TrashMonitorResponseDTO create(TrashMonitorRequestDTO dto) {
        TrashMonitor trash = trashMonitorRepository.save(trashMapper.toEntity(dto));
        return trashMapper.toResponse(trash);
    }
}
