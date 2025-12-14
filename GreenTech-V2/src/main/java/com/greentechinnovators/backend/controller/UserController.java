package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.user.CreateUserRequestDTO;
import com.greentechinnovators.backend.dto.user.UpdateProfileRequestDTO;
import com.greentechinnovators.backend.dto.user.UserProfileDTO;
import com.greentechinnovators.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileDTO> createUser(@Valid @RequestBody CreateUserRequestDTO request) {
        return ResponseEntity.ok(userService.createUser(request));
    }


    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }


    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }


    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDTO> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateProfileRequestDTO request,
            Authentication authentication) {
        
        String currentUserId = authentication.getName();
        
        // Check if user is updating their own profile or is admin
        if (!currentUserId.equals(id) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(userService.updateUserProfile(id, request));
    }


    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable String id,
            @Valid @RequestBody UpdateProfileRequestDTO request,
            Authentication authentication) {
        
        String currentUserId = authentication.getName();
        
        // Check if user is updating their own profile or is admin
        if (!currentUserId.equals(id) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(userService.updateUserProfile(id, request));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
