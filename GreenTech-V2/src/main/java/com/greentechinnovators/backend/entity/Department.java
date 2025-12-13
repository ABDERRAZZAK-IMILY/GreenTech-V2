package com.greentechinnovators.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document("Department")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Department {
    @Id
    private String id;
    private String name;
    private List<User> users;
}
