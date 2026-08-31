package com.sprintiq.service;

import com.sprintiq.entity.Role;
import com.sprintiq.entity.User;
import com.sprintiq.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ==========================================
    // CREATE ADMIN ACCOUNT
    // ==========================================

    public User register(
            String name,
            String email,
            String password) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email is already registered"
            );
        }

        String encodedPassword =
                passwordEncoder.encode(password);

        User user = new User(
                name,
                email,
                encodedPassword,
                Role.ADMIN
        );

        return userRepository.save(user);
    }

    // ==========================================
    // LOGIN
    // ==========================================

    public String login(
            String email,
            String password) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password"
                                )
                        );

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        return jwtService.generateToken(user);
    }

    // ==========================================
    // FIND USER
    // ==========================================

    public User findByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }
}