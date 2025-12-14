package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.department.DepartmentRequestDTO;
import com.greentechinnovators.backend.dto.department.DepartmentResponseDTO;
import com.greentechinnovators.backend.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    // --- 1. CREATE ---
    @PostMapping
    public ResponseEntity<DepartmentResponseDTO> createDepartment(@RequestBody @Valid DepartmentRequestDTO requestDTO) {
        DepartmentResponseDTO newDepartment = departmentService.createDepartment(requestDTO);
        return new ResponseEntity<>(newDepartment, HttpStatus.CREATED);
    }

    // --- 2. GET ALL ---
    @GetMapping
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        List<DepartmentResponseDTO> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    // --- 3. GET BY ID ---
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> getDepartmentById(@PathVariable String id) {
        DepartmentResponseDTO department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(department);
    }

    // --- 4. UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> updateDepartment(
            @PathVariable String id,
            @RequestBody @Valid DepartmentRequestDTO requestDTO) {

        DepartmentResponseDTO updatedDepartment = departmentService.updateDepartment(id, requestDTO);
        return ResponseEntity.ok(updatedDepartment);
    }

    // --- 5. DELETE ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable String id) {
        departmentService.deleteDepartment(id);
        // Return 204 No Content (Standard for delete)
        return ResponseEntity.noContent().build();
    }
}
