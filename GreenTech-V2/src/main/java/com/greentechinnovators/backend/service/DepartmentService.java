package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.department.DepartmentRequestDTO;
import com.greentechinnovators.backend.dto.department.DepartmentResponseDTO;
import com.greentechinnovators.backend.entity.Department;
import com.greentechinnovators.backend.mapper.DepartmentMapper;
import com.greentechinnovators.backend.repository.DepartmentRepository;
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

    // --- CREATE ---
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
        Department department = departmentMapper.toEntity(requestDTO);
        Department savedDepartment = departmentRepository.save(department);
        return departmentMapper.toDTO(savedDepartment);
    }

    // --- READ (All) ---
    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(departmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    // --- READ (One) ---
    public DepartmentResponseDTO getDepartmentById(String id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return departmentMapper.toDTO(department);
    }

    // --- UPDATE ---
    public DepartmentResponseDTO updateDepartment(String id, DepartmentRequestDTO requestDTO) {
        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        // Update fields
        existingDepartment.setName(requestDTO.getName());
        // Note: We usually don't update the 'users' list here directly unless specified.

        Department updatedDepartment = departmentRepository.save(existingDepartment);
        return departmentMapper.toDTO(updatedDepartment);
    }

    // --- DELETE ---
    public void deleteDepartment(String id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceAccessException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }
}
