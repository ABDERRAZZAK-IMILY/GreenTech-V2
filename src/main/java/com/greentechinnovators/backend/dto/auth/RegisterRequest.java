package com.greentechinnovators.backend.dto.auth;

import com.greentechinnovators.backend.Enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role; // ADMIN or USER
}