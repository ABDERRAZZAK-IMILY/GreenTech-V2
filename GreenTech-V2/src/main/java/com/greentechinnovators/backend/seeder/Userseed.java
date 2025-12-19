package com.greentechinnovators.backend.seeder;

import com.greentechinnovators.backend.Enums.Role;
import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.repository.UserRepository;
import lombok.extern.log4j.Log4j;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
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
            log.info(" Admin created: admin@greentech.com / admin123");
        }
    }
}