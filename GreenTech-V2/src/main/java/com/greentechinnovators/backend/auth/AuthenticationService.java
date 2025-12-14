package com.greentechinnovators.backend.auth;

import com.greentechinnovators.backend.dto.auth.AuthResponse;
import com.greentechinnovators.backend.dto.auth.LoginRequest;
import com.greentechinnovators.backend.dto.auth.RegisterRequest;
import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.mapper.UserMapper;
import com.greentechinnovators.backend.repository.UserRepository;
import com.greentechinnovators.backend.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;


    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtUtils jwtUtils,
                                 AuthenticationManager authenticationManager,
                                 UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
    }

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        User user = userMapper.toEntity(request);

        userRepository.save(user);
        return "User registered successfully!";
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtils.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        return new AuthResponse(token, user.getEmail(),user.getId(), user.getRole().name());
    }
}