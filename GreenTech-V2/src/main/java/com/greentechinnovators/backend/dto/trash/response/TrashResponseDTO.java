package com.greentechinnovators.backend.dto.trash.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TrashResponseDTO {
    private String id;
    private Double weight;
    private LocalDateTime createdAt;
}
