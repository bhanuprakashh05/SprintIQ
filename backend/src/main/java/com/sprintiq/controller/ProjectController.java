// ProjectController.java
package com.sprintiq.controller;

import com.sprintiq.entity.Project;
import com.sprintiq.entity.User;
import com.sprintiq.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(
            ProjectService projectService) {

        this.projectService = projectService;
    }

    // ==========================================
    // CREATE PROJECT
    // ==========================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project createProject(
            @RequestBody Project project,
            java.security.Principal principal) {

        return projectService.createProject(
                project.getName(),
                project.getDescription(),
                principal.getName()
        );
    }

    // ==========================================
    // GET USER'S PROJECTS
    // ==========================================

    @GetMapping
    public List<Project> getAllProjects(
            java.security.Principal principal) {

        return projectService.getProjectsForUser(
                principal.getName()
        );
    }

    // ==========================================
    // GET PROJECT
    // ==========================================

    @GetMapping("/{id}")
    public Project getProject(
            @PathVariable Long id) {

        return projectService.getProject(id);
    }

    // ==========================================
    // DELETE PROJECT
    // ==========================================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(
            @PathVariable Long id) {

        projectService.deleteProject(id);
    }

    // ==========================================
    // TEAM MEMBERS
    // ==========================================

    @GetMapping("/{projectId}/members")
    public Set<User> getProjectMembers(
            @PathVariable Long projectId) {

        return projectService.getProjectMembers(
                projectId
        );
    }

    // ==========================================
    // ADD MEMBER
    // ==========================================

    @PostMapping("/{projectId}/members/{userId}")
    public Project addMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {

        return projectService.addMember(
                projectId,
                userId
        );
    }

    // ==========================================
    // REMOVE MEMBER
    // ==========================================

    @DeleteMapping("/{projectId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {

        projectService.removeMember(
                projectId,
                userId
        );
    }
}