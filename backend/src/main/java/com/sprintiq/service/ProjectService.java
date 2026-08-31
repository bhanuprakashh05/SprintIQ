// ProjectService.java
package com.sprintiq.service;

import com.sprintiq.entity.Project;
import com.sprintiq.entity.User;
import com.sprintiq.repository.ProjectRepository;
import com.sprintiq.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
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

    // ==========================================
    // CREATE PROJECT
    // ==========================================

    public Project createProject(
            String name,
            String description,
            String ownerEmail) {

        User owner =
                userRepository.findByEmail(ownerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        Project project =
                new Project(
                        name,
                        description,
                        owner
                );

        return projectRepository.save(project);
    }

    // ==========================================
    // GET PROJECTS ACCESSIBLE TO USER
    // ==========================================

    public List<Project> getProjectsForUser(
            String email) {

        Set<Project> accessibleProjects =
                new LinkedHashSet<>();

        accessibleProjects.addAll(
                projectRepository
                        .findByOwnerEmail(email)
        );

        accessibleProjects.addAll(
                projectRepository
                        .findByMembersEmail(email)
        );

        return accessibleProjects.stream().toList();
    }

    // ==========================================
    // GET PROJECT
    // ==========================================

    public Project getProject(Long id) {

        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Project not found"));
    }

    // ==========================================
    // DELETE PROJECT
    // ==========================================

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    // ==========================================
    // TEAM MEMBERS
    // ==========================================

    public Set<User> getProjectMembers(
            Long projectId) {

        Project project =
                getProject(projectId);

        return project.getMembers();
    }

    // ==========================================
    // ADD MEMBER
    // ==========================================

    public Project addMember(
            Long projectId,
            Long userId) {

        Project project =
                getProject(projectId);

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        project.addMember(user);

        return projectRepository.save(project);
    }

    // ==========================================
    // REMOVE MEMBER
    // ==========================================

    public Project removeMember(
            Long projectId,
            Long userId) {

        Project project =
                getProject(projectId);

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        project.removeMember(user);

        return projectRepository.save(project);
    }
}