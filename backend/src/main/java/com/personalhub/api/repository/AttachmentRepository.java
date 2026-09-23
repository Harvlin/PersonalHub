package com.personalhub.api.repository;

import com.personalhub.api.entity.Attachment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByProjectIdOrderByUploadedAtDesc(UUID projectId);
}
