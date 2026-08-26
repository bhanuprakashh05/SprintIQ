package com.sprintiq.controller;

import com.sprintiq.dto.TaskResponse;
import com.sprintiq.dto.UserResponse;
import com.sprintiq.entity.Task;
import com.sprintiq.entity.TaskStatus;
import com.sprintiq.entity.User;
import com.sprintiq.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@RequestBody TaskRequest request) {

        TaskStatus status = TaskStatus.valueOf(request.status());

        Task task = taskService.createTask(
                request.title(),
                request.description(),
                status,
                request.priority(),
                request.projectId(),
                request.sprintId(),
                request.assignedToId()
        );

        return toResponse(task);
    }

    @GetMapping
    public List<TaskResponse> getAllTasks() {
        return taskService.getAllTasks()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@PathVariable Long id) {
        return toResponse(taskService.getTask(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    private TaskResponse toResponse(Task task) {

        User assignedTo = task.getAssignedTo();

        UserResponse assignedToResponse = assignedTo == null
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