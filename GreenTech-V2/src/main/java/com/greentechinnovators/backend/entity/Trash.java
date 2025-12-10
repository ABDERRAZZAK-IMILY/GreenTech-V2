package com.greentechinnovators.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document("Trash")
@Data
@Builder
public class Trash {
    @Id
    private String id;
    private Double wight;
    private LocalDateTime createdAt =  LocalDateTime.now();
}
