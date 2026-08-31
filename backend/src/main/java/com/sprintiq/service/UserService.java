package com.sprintiq.service;

import com.sprintiq.entity.Role;
import com.sprintiq.entity.User;
import com.sprintiq.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // ADMIN creates a MEMBER account
    public User createMember(
            String name,
            String email,
            String password) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email is already registered");
        }

        String encodedPassword =
                passwordEncoder.encode(password);

        User member = new User(
                name,
                email,
                encodedPassword,
                Role.MEMBER
        );

        return userRepository.save(member);
    }
}