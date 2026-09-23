package com.personalhub.api.repository;

import com.personalhub.api.entity.Milestone;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {
    List<Milestone> findByProjectIdOrderByNameAsc(UUID projectId);
}
