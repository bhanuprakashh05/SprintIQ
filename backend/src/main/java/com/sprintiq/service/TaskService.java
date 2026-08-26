package com.sprintiq.service;

import com.sprintiq.entity.Project;
import com.sprintiq.entity.Sprint;
import com.sprintiq.entity.Task;
import com.sprintiq.entity.TaskStatus;
import com.sprintiq.entity.User;
import com.sprintiq.repository.ProjectRepository;
import com.sprintiq.repository.SprintRepository;
import com.sprintiq.repository.TaskRepository;
import com.sprintiq.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            SprintRepository sprintRepository,
            UserRepository userRepository) {

        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.sprintRepository = sprintRepository;
        this.userRepository = userRepository;
    }

    public Task createTask(
            String title,
            String description,
            TaskStatus status,
            String priority,
            Long projectId,
            Long sprintId,
            Long assignedToId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        User assignedTo = null;

        if (assignedToId != null) {
            assignedTo = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        Task task = new Task(
                title,
                description,
                status,
                priority,
                project,
                sprint,
                assignedTo
        );

        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}