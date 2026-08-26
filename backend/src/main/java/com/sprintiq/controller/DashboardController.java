package com.sprintiq.controller;

import com.sprintiq.dto.DashboardStats;
import com.sprintiq.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/projects/{projectId}")
    public DashboardStats getProjectStats(
            @PathVariable Long projectId) {

        return dashboardService.getProjectStats(projectId);
    }

    @GetMapping("/sprints/{sprintId}")
    public DashboardStats getSprintStats(
            @PathVariable Long sprintId) {

        return dashboardService.getSprintStats(sprintId);
    }
}