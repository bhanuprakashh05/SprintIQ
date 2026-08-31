package com.sprintiq.repository;

import com.sprintiq.entity.Sprint;
import com.sprintiq.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    @Query("""
        SELECT s
        FROM Sprint s
        WHERE s.project.owner.email = :email
           OR EXISTS (
                SELECT m
                FROM s.project.members m
                WHERE m.email = :email
           )
        """)
    List<Sprint> findAccessibleSprints(
            @Param("email") String email
    );

    @Query("SELECT t FROM Task t WHERE t.sprint.id = :sprintId")
    List<Task> findTasksBySprintId(
            @Param("sprintId") Long sprintId
    );
}