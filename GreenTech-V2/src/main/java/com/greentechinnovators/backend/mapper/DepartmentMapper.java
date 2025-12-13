package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.UserResponseDTO;
import com.greentechinnovators.backend.dto.department.DepartmentRequestDTO;
import com.greentechinnovators.backend.dto.department.DepartmentResponseDTO;
import com.greentechinnovators.backend.entity.Department;
import com.greentechinnovators.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DepartmentMapper {

    // Inject UserMapper if you have one to keep things clean
    // private final UserMapper userMapper;

    /**
     * Convert RequestDTO to Entity
     */
    public Department toEntity(DepartmentRequestDTO requestDTO) {
        if (requestDTO == null) return null;

        return Department.builder()
                .name(requestDTO.getName())
                .users(new ArrayList<>()) // Initialize empty list to avoid NullPointerException
                .build();
    }

    /**
     * Convert Entity to ResponseDTO
     */
    public DepartmentResponseDTO toDTO(Department department) {
        if (department == null) return null;

        return DepartmentResponseDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .build();
    }

    // --- Helper to map the list of users ---
    private List<UserResponseDTO> mapUsers(List<User> users) {
        if (users == null || users.isEmpty()) {
            return new ArrayList<>();
        }

        return users.stream()
                .map(this::toUserDTO) // Call helper or use userMapper.toDTO(user)
                .collect(Collectors.toList());
    }

    // Simple manual mapping for User if you don't have a UserMapper yet
    private UserResponseDTO toUserDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .build();
    }
}
