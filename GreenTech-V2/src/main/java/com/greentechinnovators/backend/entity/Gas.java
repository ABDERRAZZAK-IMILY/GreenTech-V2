package com.greentechinnovators.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document("Gas")
public class Gas {
    @Id
    private String id;
    private Double consumedGas;
    private LocalDateTime createdAt =  LocalDateTime.now();
}
