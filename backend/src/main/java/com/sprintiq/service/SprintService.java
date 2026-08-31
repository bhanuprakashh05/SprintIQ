package com.sprintiq.service;

import com.sprintiq.entity.Project;
import com.sprintiq.entity.Sprint;
import com.sprintiq.entity.Task;
import com.sprintiq.entity.TaskStatus;
import com.sprintiq.repository.ProjectRepository;
import com.sprintiq.repository.SprintRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    public SprintService(
            SprintRepository sprintRepository,
            ProjectRepository projectRepository) {

        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    public Sprint createSprint(
            String name,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        Sprint sprint = new Sprint(
                name,
                startDate,
                endDate,
                status,
                project
        );

        return sprintRepository.save(sprint);
    }

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public Sprint getSprint(Long id) {
        return sprintRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Sprint not found"));
    }

    public int getSprintProgress(Long sprintId) {

        List<Task> tasks =
                sprintRepository.findTasksBySprintId(sprintId);

        if (tasks.isEmpty()) {
            return 0;
        }

        long completedTasks =
                tasks.stream()
                        .filter(task ->
                                task.getStatus() ==
                                        TaskStatus.DONE)
                        .count();

        return (int) (
                (completedTasks * 100) /
                tasks.size()
        );
    }

    public void deleteSprint(Long id) {
        sprintRepository.deleteById(id);
    }
    public Sprint updateSprint(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        Long projectId) {

    Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Sprint not found"));

    Project project = projectRepository.findById(projectId)
            .orElseThrow(() ->
                    new RuntimeException("Project not found"));

    sprint.setName(name);
    sprint.setStartDate(startDate);
    sprint.setEndDate(endDate);
    sprint.setStatus(status);
    sprint.setProject(project);

    return sprintRepository.save(sprint);
}
}