package com.personalhub.api.repository;

import com.personalhub.api.entity.Resource;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByProjectIdOrderByAddedAtDesc(UUID projectId);
}
