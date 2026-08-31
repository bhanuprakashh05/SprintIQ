package com.sprintiq.controller;

import com.sprintiq.entity.Sprint;
import com.sprintiq.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sprint createSprint(@RequestBody SprintRequest request) {

        return sprintService.createSprint(
                request.name(),
                request.startDate(),
                request.endDate(),
                request.status(),
                request.projectId()
        );
    }

    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintService.getAllSprints();
    }

    @GetMapping("/{id}")
    public Sprint getSprint(@PathVariable Long id) {
        return sprintService.getSprint(id);
    }

    @PutMapping("/{id}")
    public Sprint updateSprint(
            @PathVariable Long id,
            @RequestBody SprintRequest request) {

        return sprintService.updateSprint(
                id,
                request.name(),
                request.startDate(),
                request.endDate(),
                request.status(),
                request.projectId()
        );
    }

    @GetMapping("/{id}/progress")
    public int getSprintProgress(
            @PathVariable Long id) {

        return sprintService.getSprintProgress(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
    }

    public record SprintRequest(
            String name,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            Long projectId
    ) {
    }
}