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
    @Builder.Default
    private String profilePicture = "https://static.vecteezy.com/system/resources/previews/019/879/186/large_2x/user-icon-on-transparent-background-free-png.png";   // URL to profile image
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();  // Registration date
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();  // Last update date

    public User(String name, String email, String passwordHash, Role role, String department, String jobTitle, String profilePicture) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.department = department;
        this.jobTitle = jobTitle;
        this.profilePicture = profilePicture;
    }
}
