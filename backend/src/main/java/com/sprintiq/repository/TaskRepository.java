package com.sprintiq.repository;

import com.sprintiq.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findBySprintId(Long sprintId);

    List<Task> findByProjectId(Long projectId);
}