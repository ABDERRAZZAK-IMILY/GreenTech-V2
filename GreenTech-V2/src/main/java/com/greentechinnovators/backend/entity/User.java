package com.greentechinnovators.backend.entity;


import com.greentechinnovators.backend.Enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String passwordHash;
    private Role role;  // Application role (USER, ADMIN)
    private String department;  // Department/Team
    private String jobTitle;  // Job position (Developer, Manager, etc.)
    
    // Profile fields
    private String profilePicture;   // URL to profile image
    private LocalDateTime createdAt;  // Registration date
    private LocalDateTime updatedAt;  // Last update date
}
