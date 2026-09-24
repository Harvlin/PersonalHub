package com.personalhub.api.service;

import com.personalhub.api.dto.CreateAttachmentRequest;
import com.personalhub.api.dto.CreateMilestoneRequest;
import com.personalhub.api.dto.CreateProjectRequest;
import com.personalhub.api.dto.CreateResourceRequest;
import com.personalhub.api.dto.AttachmentDto;
import com.personalhub.api.dto.MilestoneDto;
import com.personalhub.api.dto.ProjectDto;
import com.personalhub.api.dto.ResourceDto;
import com.personalhub.api.dto.RequestModels;
import java.util.List;
import java.util.UUID;

public interface ProjectService {
    List<ProjectDto> findAll();
    ProjectDto findById(UUID id);
    ProjectDto create(CreateProjectRequest request);
    ProjectDto update(UUID id, RequestModels.ProjectPatch request);
    void delete(UUID id);
    List<MilestoneDto> milestones(UUID projectId);
    MilestoneDto addMilestone(UUID projectId, CreateMilestoneRequest request);
    MilestoneDto updateMilestone(UUID projectId, UUID milestoneId, RequestModels.MilestonePatch request);
    void deleteMilestone(UUID projectId, UUID milestoneId);
    List<ResourceDto> resources(UUID projectId);
    ResourceDto addResource(UUID projectId, CreateResourceRequest request);
    void deleteResource(UUID projectId, UUID resourceId);
    List<AttachmentDto> attachments(UUID projectId);
    AttachmentDto addAttachment(UUID projectId, CreateAttachmentRequest request);
    void deleteAttachment(UUID projectId, UUID attachmentId);
}
