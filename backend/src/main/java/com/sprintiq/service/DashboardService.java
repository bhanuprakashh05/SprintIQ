package com.sprintiq.service;

import com.sprintiq.dto.DashboardStats;
import com.sprintiq.entity.Task;
import com.sprintiq.entity.TaskStatus;
import com.sprintiq.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final TaskRepository taskRepository;

    public DashboardService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public DashboardStats getProjectStats(Long projectId) {

        List<Task> tasks = taskRepository.findAll()
                .stream()
                .filter(task -> task.getProject().getId().equals(projectId))
                .toList();

        return calculateStats(tasks);
    }

    public DashboardStats getSprintStats(Long sprintId) {

        List<Task> tasks = taskRepository.findAll()
                .stream()
                .filter(task -> task.getSprint() != null)
                .filter(task -> task.getSprint().getId().equals(sprintId))
                .toList();

        return calculateStats(tasks);
    }

    private DashboardStats calculateStats(List<Task> tasks) {

        long totalTasks = tasks.size();

        long todoTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.TODO)
                .count();

        long inProgressTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS)
                .count();

        long completedTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();

        double completionPercentage = totalTasks == 0
                ? 0
                : (completedTasks * 100.0) / totalTasks;

        return new DashboardStats(
                totalTasks,
                todoTasks,
                inProgressTasks,
                completedTasks,
                completionPercentage
        );
    }
}