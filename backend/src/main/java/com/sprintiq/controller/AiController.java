package com.sprintiq.controller;

import com.sprintiq.entity.Sprint;
import com.sprintiq.entity.Task;
import com.sprintiq.entity.TaskStatus;
import com.sprintiq.repository.SprintRepository;
import com.sprintiq.service.AiService;
import com.sprintiq.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final TaskService taskService;
    private final SprintRepository sprintRepository;

    public AiController(
            AiService aiService,
            TaskService taskService,
            SprintRepository sprintRepository) {

        this.aiService = aiService;
        this.taskService = taskService;
        this.sprintRepository = sprintRepository;
    }

    @GetMapping("/sprint-risk/{sprintId}")
    public Map<String, Object> predictSprintRisk(
            @PathVariable Long sprintId) {

        // Find the sprint
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() ->
                        new RuntimeException("Sprint not found"));

        // Get all tasks
        List<Task> tasks = taskService.getAllTasks()
                .stream()
                .filter(task -> task.getSprint() != null)
                .filter(task ->
                        task.getSprint()
                                .getId()
                                .equals(sprintId))
                .toList();

        // Count total tasks
        int totalTasks = tasks.size();

        // Count task statuses
        int completedTasks = (int) tasks.stream()
                .filter(task ->
                        task.getStatus() == TaskStatus.DONE)
                .count();

        int inProgressTasks = (int) tasks.stream()
                .filter(task ->
                        task.getStatus() == TaskStatus.IN_PROGRESS)
                .count();

        int todoTasks = (int) tasks.stream()
                .filter(task ->
                        task.getStatus() == TaskStatus.TODO)
                .count();

        // Count task priorities
        int highPriorityTasks = (int) tasks.stream()
                .filter(task ->
                        "HIGH".equalsIgnoreCase(
                                task.getPriority()))
                .count();

        int mediumPriorityTasks = (int) tasks.stream()
                .filter(task ->
                        "MEDIUM".equalsIgnoreCase(
                                task.getPriority()))
                .count();

        int lowPriorityTasks = (int) tasks.stream()
                .filter(task ->
                        "LOW".equalsIgnoreCase(
                                task.getPriority()))
                .count();

        // Calculate remaining days
        LocalDate today = LocalDate.now();

        int daysRemaining = (int) Math.max(
                0,
                ChronoUnit.DAYS.between(
                        today,
                        sprint.getEndDate()
                )
        );

        // Send sprint information to the ML service
        return aiService.predictSprintRisk(
                totalTasks,
                completedTasks,
                inProgressTasks,
                todoTasks,
                daysRemaining,
                highPriorityTasks,
                mediumPriorityTasks,
                lowPriorityTasks
        );
    }
}