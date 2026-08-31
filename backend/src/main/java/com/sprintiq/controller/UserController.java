package com.sprintiq.controller;

import com.sprintiq.dto.UserResponse;
import com.sprintiq.entity.User;
import com.sprintiq.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {

        this.userService = userService;
    }

    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping
    public List<UserResponse> getAllUsers() {

        return userService.getAllUsers()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // GET USER
    // =====================================================

    @GetMapping("/{id}")
    public UserResponse getUser(
            @PathVariable Long id) {

        return toResponse(
                userService.getUser(id)
        );
    }


    // =====================================================
    // ADMIN CREATES MEMBER
    // =====================================================

    @PostMapping("/members")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createMember(
            @Valid @RequestBody CreateMemberRequest request) {

        User member =
                userService.createMember(
                        request.name(),
                        request.email(),
                        request.password()
                );

        return toResponse(member);
    }


    // =====================================================
    // RESPONSE
    // =====================================================

    private UserResponse toResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }


    // =====================================================
    // REQUEST
    // =====================================================

    public record CreateMemberRequest(

            @NotBlank(
                    message = "Name is required"
            )
            String name,

            @NotBlank(
                    message = "Email is required"
            )
            @Email(
                    message = "Invalid email"
            )
            String email,

            @NotBlank(
                    message = "Password is required"
            )
            @Size(
                    min = 6,
                    message = "Password must contain at least 6 characters"
            )
            String password

    ) {
    }
}