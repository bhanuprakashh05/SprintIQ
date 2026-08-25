package com.sprintiq.dto;

import com.sprintiq.entity.Role;

public record LoginResponse(
        Long id,
        String name,
        String email,
        Role role,
        String token
) {
}