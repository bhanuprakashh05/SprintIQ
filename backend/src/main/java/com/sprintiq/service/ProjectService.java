package com.sprintiq.service;

import com.sprintiq.entity.Project;
import com.sprintiq.entity.User;
import com.sprintiq.repository.ProjectRepository;
import com.sprintiq.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository) {

        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Project createProject(
            String name,
            String description) {

        Project project =
                new Project(name, description);

        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Project not found"));
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    // Get all team members of a project
    public Set<User> getProjectMembers(Long projectId) {

        Project project = getProject(projectId);

        return project.getMembers();
    }

    // Add a user to a project
    public Project addMember(
            Long projectId,
            Long userId) {

        Project project = getProject(projectId);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        project.addMember(user);

        return projectRepository.save(project);
    }

    // Remove a user from a project
    public Project removeMember(
            Long projectId,
            Long userId) {

        Project project = getProject(projectId);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        project.removeMember(user);

        return projectRepository.save(project);
    }
}