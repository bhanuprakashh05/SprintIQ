package com.sprintiq.service;

import com.sprintiq.entity.Project;
import com.sprintiq.entity.Role;
import com.sprintiq.entity.Sprint;
import com.sprintiq.entity.Task;
import com.sprintiq.entity.TaskStatus;
import com.sprintiq.entity.User;
import com.sprintiq.repository.ProjectRepository;
import com.sprintiq.repository.SprintRepository;
import com.sprintiq.repository.TaskRepository;
import com.sprintiq.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
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

    // ==========================================
    // CREATE TASK
    // ==========================================

    public Task createTask(
            String title,
            String description,
            TaskStatus status,
            String priority,
            Long projectId,
            Long sprintId,
            Long assignedToId,
            String currentUserEmail) {

        User currentUser =
                userRepository.findByEmail(
                        currentUserEmail
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        // Only ADMIN can create tasks
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException(
                    "Only ADMIN can create tasks"
            );
        }

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                ));

        Sprint sprint =
                sprintRepository.findById(sprintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sprint not found"
                                ));

        // Sprint must belong to the selected project
        if (!sprint.getProject()
                .getId()
                .equals(project.getId())) {

            throw new RuntimeException(
                    "Sprint does not belong to this project"
            );
        }

        User assignedTo = null;

        if (assignedToId != null) {

            assignedTo =
                    userRepository.findById(
                            assignedToId
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "User not found"
                            ));

            // Assigned user must belong
            // to the project
            if (!project.getMembers()
                    .contains(assignedTo)) {

                throw new RuntimeException(
                        "User is not a member of this project"
                );
            }
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

    // ==========================================
    // GET ALL TASKS
    // ==========================================

    public List<Task> getAllTasks(
        String currentUserEmail) {

    return taskRepository.findAccessibleTasks(
            currentUserEmail
    );
}

    // ==========================================
    // GET SINGLE TASK
    // ==========================================

    public Task getTask(Long id) {

        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Task not found"
                        ));
    }

    // ==========================================
    // UPDATE TASK STATUS
    // ==========================================

    public Task updateTaskStatus(
            Long id,
            TaskStatus status,
            String currentUserEmail) {

        Task task = getTask(id);

        User currentUser =
                userRepository.findByEmail(
                        currentUserEmail
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        // ADMIN can update any task
        if (currentUser.getRole() ==
                Role.ADMIN) {

            task.setStatus(status);

            return taskRepository.save(task);
        }

        // MEMBER can update only
        // their assigned task
        if (task.getAssignedTo() == null ||
                !task.getAssignedTo()
                        .getId()
                        .equals(currentUser.getId())) {

            throw new AccessDeniedException(
                    "You can only update tasks assigned to you"
            );
        }

        task.setStatus(status);

        return taskRepository.save(task);
    }

    // ==========================================
    // UPDATE TASK DETAILS
    // ADMIN ONLY
    // ==========================================

    public Task updateTask(
            Long id,
            String title,
            String description,
            TaskStatus status,
            String priority,
            Long projectId,
            Long sprintId,
            Long assignedToId,
            String currentUserEmail) {

        Task task = getTask(id);

        User currentUser =
                userRepository.findByEmail(
                        currentUserEmail
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        if (currentUser.getRole() !=
                Role.ADMIN) {

            throw new AccessDeniedException(
                    "Only ADMIN can edit task details"
            );
        }

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                ));

        Sprint sprint =
                sprintRepository.findById(sprintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sprint not found"
                                ));

        // Sprint must belong to project
        if (!sprint.getProject()
                .getId()
                .equals(project.getId())) {

            throw new RuntimeException(
                    "Sprint does not belong to this project"
            );
        }

        User assignedTo = null;

        if (assignedToId != null) {

            assignedTo =
                    userRepository.findById(
                            assignedToId
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "User not found"
                            ));

            if (!project.getMembers()
                    .contains(assignedTo)) {

                throw new RuntimeException(
                        "User is not a member of this project"
                );
            }
        }

        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setProject(project);
        task.setSprint(sprint);
        task.setAssignedTo(assignedTo);

        return taskRepository.save(task);
    }

    // ==========================================
    // DELETE TASK
    // ADMIN ONLY
    // ==========================================

    public void deleteTask(
            Long id,
            String currentUserEmail) {

        User currentUser =
                userRepository.findByEmail(
                        currentUserEmail
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        if (currentUser.getRole() !=
                Role.ADMIN) {

            throw new AccessDeniedException(
                    "Only ADMIN can delete tasks"
            );
        }

        Task task = getTask(id);

        taskRepository.delete(task);
    }
}