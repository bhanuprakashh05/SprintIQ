package com.sprintiq.repository;

import com.sprintiq.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findBySprintId(Long sprintId);

    List<Task> findByProjectId(Long projectId);

    @Query("""
        SELECT t
        FROM Task t
        WHERE t.project.owner.email = :email
           OR EXISTS (
                SELECT m
                FROM t.project.members m
                WHERE m.email = :email
           )
        """)
    List<Task> findAccessibleTasks(
            @Param("email") String email
    );
}