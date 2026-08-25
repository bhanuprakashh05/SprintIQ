package com.sprintiq.dto;

import com.sprintiq.entity.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
}