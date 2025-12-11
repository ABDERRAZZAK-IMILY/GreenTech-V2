package com.greentechinnovators.backend.dto.AI;

import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class TopConsumerStats {
    @Id
    private String location;
    private Double total;
}