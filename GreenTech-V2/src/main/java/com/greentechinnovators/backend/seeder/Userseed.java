package com.greentechinnovators.backend.seeder;

import com.greentechinnovators.backend.Enums.Role;
import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class Userseed implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Userseed(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@greentech.com")) {
            User admin = new User(
                    "Super Admin",
                    "admin@greentech.com",
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN,
                    "lead",
                    "admin",
                    "https://static.vecteezy.com/system/resources/previews/019/879/186/large_2x/user-icon-on-transparent-background-free-png.png"
            );
            userRepository.save(admin);
            System.out.println(" Admin created: admin@greentech.com / admin123");
        }

        if (!userRepository.existsByEmail("imily@greentech.com")) {
            User user = new User(
                    "imily",
                    "imily@greentech.com",
                    passwordEncoder.encode("user123"),
                    Role.USER,
                    "IT",
                    "developer",
                    "https://static.vecteezy.com/system/resources/previews/019/879/186/large_2x/user-icon-on-transparent-background-free-png.png"
            );
            userRepository.save(user);

            System.out.println(" User created: imily@greentech.com / user123");
        }
    }
}