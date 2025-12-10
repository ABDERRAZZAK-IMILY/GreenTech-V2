package com.greentechinnovators.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TrashDtoResponse {

    private String id;
    private Double wight;
    private LocalDateTime createdAt =  LocalDateTime.now();


}
