package com.sprintiq.dto;

public record DashboardStats(
        long totalTasks,
        long todoTasks,
        long inProgressTasks,
        long completedTasks,
        double completionPercentage
) {
}