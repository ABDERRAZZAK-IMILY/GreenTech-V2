package com.greentechinnovators.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document("Energy")
@Data
@Builder
public class Energy {
    @Id
    private String id;
    private Double energyConsumed;
    private LocalDateTime createdAt =  LocalDateTime.now();
}
