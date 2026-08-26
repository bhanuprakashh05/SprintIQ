package com.sprintiq.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    private String priority;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    public Task() {
    }

    public Task(String title, String description, TaskStatus status,
                String priority, Project project, Sprint sprint,
                User assignedTo) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.project = project;
        this.sprint = sprint;
        this.assignedTo = assignedTo;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public Project getProject() {
        return project;
    }

    public Sprint getSprint() {
        return sprint;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }
}