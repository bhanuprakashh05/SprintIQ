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

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String name, String email, String password) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        String encodedPassword = passwordEncoder.encode(password);

        User user = new User(
                name,
                email,
                encodedPassword,
                Role.MEMBER
        );

        return userRepository.save(user);
    }
}