package com.sprintiq.dto;

public record LoginRequest(
        String email,
        String password
) {
}