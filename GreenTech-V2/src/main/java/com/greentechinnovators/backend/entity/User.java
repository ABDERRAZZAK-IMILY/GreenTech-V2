package com.greentechinnovators.backend.entity;


import com.greentechinnovators.backend.Enums.Role;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {

    private String id;
    private String name;
    private String email;
    private String passwordHash;

    private Role role;

    public User(String name, String email, String passwordHash, Role role) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }


}
