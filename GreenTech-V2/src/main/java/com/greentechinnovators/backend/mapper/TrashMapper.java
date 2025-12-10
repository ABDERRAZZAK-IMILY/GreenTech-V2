package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.TrashDtoRequest;
import com.greentechinnovators.backend.dto.TrashDtoResponse;
import com.greentechinnovators.backend.entity.Trash;
import org.springframework.stereotype.Component;

@Component
public class TrashMapper {

    public Trash toEntity(TrashDtoRequest dto) {
        if (dto == null) {
            return null;
        }

      return  Trash.builder()
                .wight(dto.getWight())
                .build();
    }

    public TrashDtoResponse todto(Trash entity) {
        if (entity == null) {
            return null;
        }

        return TrashDtoResponse.builder()
                .id(entity.getId())
                .wight(entity.getWight())
                .createdAt(entity.getCreatedAt())
                .build();
    }


}
