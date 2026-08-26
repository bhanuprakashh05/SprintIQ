package com.sprintiq.dto;

import com.sprintiq.entity.Project;
import com.sprintiq.entity.Sprint;

public record TaskResponse(
        Long id,
        String title,
        String description,
        String status,
        String priority,
        Project project,
        Sprint sprint,
        UserResponse assignedTo
) {
}