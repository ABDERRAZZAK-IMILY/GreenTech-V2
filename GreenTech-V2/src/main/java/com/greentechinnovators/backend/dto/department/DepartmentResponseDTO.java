package com.greentechinnovators.backend.dto.department;

import com.greentechinnovators.backend.dto.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentResponseDTO {
    private String id;
    private String name;
    private List<UserResponseDTO> users;
}
