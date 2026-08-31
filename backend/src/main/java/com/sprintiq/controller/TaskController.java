package com.sprintiq.controller;

import com.sprintiq.dto.TaskResponse;
import com.sprintiq.dto.UserResponse;
import com.sprintiq.entity.Task;
import com.sprintiq.entity.TaskStatus;
import com.sprintiq.entity.User;
import com.sprintiq.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ==========================================
    // CREATE TASK
    // ==========================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(
            @RequestBody TaskRequest request,
            Authentication authentication) {

        String currentUserEmail =
                authentication.getName();

        TaskStatus status =
                TaskStatus.valueOf(
                        request.status()
                );

        Task task = taskService.createTask(
                request.title(),
                request.description(),
                status,
                request.priority(),
                request.projectId(),
                request.sprintId(),
                request.assignedToId(),
                currentUserEmail
        );

        return toResponse(task);
    }

    // ==========================================
    // GET ALL TASKS
    // ==========================================

    @GetMapping
    public List<TaskResponse> getAllTasks() {

        return taskService.getAllTasks()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==========================================
    // GET SINGLE TASK
    // ==========================================

    @GetMapping("/{id}")
    public TaskResponse getTask(
            @PathVariable Long id) {

        return toResponse(
                taskService.getTask(id)
        );
    }

    // ==========================================
    // UPDATE TASK STATUS
    // ==========================================

    @PatchMapping("/{id}/status")
    public TaskResponse updateTaskStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {

        TaskStatus taskStatus =
                TaskStatus.valueOf(status);

        String currentUserEmail =
                authentication.getName();

        Task task =
                taskService.updateTaskStatus(
                        id,
                        taskStatus,
                        currentUserEmail
                );

        return toResponse(task);
    }

    // ==========================================
    // UPDATE TASK DETAILS
    // ADMIN ONLY
    // ==========================================

    @PutMapping("/{id}")
    public TaskResponse updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest request,
            Authentication authentication) {

        String currentUserEmail =
                authentication.getName();

        TaskStatus status =
                TaskStatus.valueOf(
                        request.status()
                );

        Task task =
                taskService.updateTask(
                        id,
                        request.title(),
                        request.description(),
                        status,
                        request.priority(),
                        request.projectId(),
                        request.sprintId(),
                        request.assignedToId(),
                        currentUserEmail
                );

        return toResponse(task);
    }

    // ==========================================
    // DELETE TASK
    // ADMIN ONLY
    // ==========================================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        String currentUserEmail =
                authentication.getName();

        taskService.deleteTask(
                id,
                currentUserEmail
        );
    }

    // ==========================================
    // RESPONSE MAPPER
    // ==========================================

    private TaskResponse toResponse(
            Task task) {

        User assignedTo =
                task.getAssignedTo();

        UserResponse assignedToResponse =
                assignedTo == null
                        ? null
                        : new UserResponse(
                                assignedTo.getId(),
                                assignedTo.getName(),
                                assignedTo.getEmail(),
                                assignedTo.getRole()
                        );

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name(),
                task.getPriority(),
                task.getProject(),
                task.getSprint(),
                assignedToResponse
        );
    }

    // ==========================================
    // REQUEST DTO
    // ==========================================

    public record TaskRequest(
            String title,
            String description,
            String status,
            String priority,
            Long projectId,
            Long sprintId,
            Long assignedToId
    ) {
    }
}