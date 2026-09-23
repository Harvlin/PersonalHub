package com.personalhub.api.repository;

import com.personalhub.api.entity.Interaction;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteractionRepository extends JpaRepository<Interaction, UUID> {
    List<Interaction> findByContactIdOrderByDateDesc(UUID contactId);
    List<Interaction> findAllByOrderByDateDesc();
}
