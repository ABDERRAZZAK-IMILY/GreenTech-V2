package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.UserResponseDTO;
import com.greentechinnovators.backend.dto.department.DepartmentRequestDTO;
import com.greentechinnovators.backend.dto.department.DepartmentResponseDTO;
import com.greentechinnovators.backend.entity.Department;
import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.mapper.DepartmentMapper;
import com.greentechinnovators.backend.mapper.UserMapper;
import com.greentechinnovators.backend.repository.DepartmentRepository;
import com.greentechinnovators.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final UserRepository userRepository;
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
        Department department = departmentMapper.toEntity(requestDTO);
        Department savedDepartment = departmentRepository.save(department);
        return departmentMapper.toDTO(savedDepartment);
    }

    public List<DepartmentResponseDTO> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();

        return departments.stream().map(dept -> {
            List<User> realUsers = userRepository.findByDepartment(dept.getName());

            List<UserResponseDTO> userDTOs = realUsers.stream()
                    .map(UserMapper::toUserDTO)
                    .collect(Collectors.toList());

            return DepartmentResponseDTO.builder()
                    .id(dept.getId())
                    .name(dept.getName())
                    .users(userDTOs)
                    .build();

        }).collect(Collectors.toList());
    }

    public DepartmentResponseDTO getDepartmentById(String id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return departmentMapper.toDTO(department);
    }

    public DepartmentResponseDTO updateDepartment(String id, DepartmentRequestDTO requestDTO) {
        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        existingDepartment.setName(requestDTO.getName());

        Department updatedDepartment = departmentRepository.save(existingDepartment);
        return departmentMapper.toDTO(updatedDepartment);
    }

    public void deleteDepartment(String id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceAccessException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }
}
