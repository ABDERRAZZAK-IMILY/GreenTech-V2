package com.greentechinnovators.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {
    private String id;
    private String username;
    private String email;
    // Do NOT include password here
}
