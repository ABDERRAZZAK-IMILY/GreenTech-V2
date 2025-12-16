package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.UserResponseDTO;
import com.greentechinnovators.backend.dto.auth.RegisterRequest;
import com.greentechinnovators.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User toEntity(RegisterRequest dto){
        return User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .role(dto.getRole())
                .department(dto.getDepartment())
                .build();
    }

    public static UserResponseDTO toUserDTO(User user) {
        if (user == null) return null;

        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getName())
                .email(user.getEmail())
                .build();
    }

}
