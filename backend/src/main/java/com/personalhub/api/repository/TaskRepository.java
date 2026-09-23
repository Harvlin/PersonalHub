package com.personalhub.api.repository;

import com.personalhub.api.entity.Task;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findAllByOrderByCreatedAtDesc();
    List<Task> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
}
