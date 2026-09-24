package com.personalhub.api.service.impl;

import com.personalhub.api.dto.*;
import com.personalhub.api.entity.*;
import com.personalhub.api.enums.Status;
import com.personalhub.api.mapper.*;
import com.personalhub.api.repository.*;
import com.personalhub.api.service.ProjectService;
import com.personalhub.api.web.ApiException;
import com.personalhub.api.dto.RequestModels;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projects;
    private final MilestoneRepository milestones;
    private final ResourceRepository resources;
    private final AttachmentRepository attachments;
    private final ProjectMapper projectMapper;
    private final MilestoneMapper milestoneMapper;
    private final ResourceMapper resourceMapper;
    private final AttachmentMapper attachmentMapper;
    private final TaskRepository tasks;

    @Override @Transactional(readOnly = true)
    public List<ProjectDto> findAll() { return projects.findAllByOrderByUpdatedAtDesc().stream().map(projectMapper::toDto).toList(); }
    @Override @Transactional(readOnly = true)
    public ProjectDto findById(UUID id) { return projectMapper.toDto(project(id)); }
    @Override
    public ProjectDto create(CreateProjectRequest request) { Project entity = projectMapper.toEntity(request); entity.setCreatedAt(Instant.now()); entity.setUpdatedAt(Instant.now()); return projectMapper.toDto(projects.save(entity)); }
    @Override
    public ProjectDto update(UUID id, RequestModels.ProjectPatch request) { Project entity = project(id); if (request.name() != null) entity.setName(request.name()); if (request.description() != null) entity.setDescription(request.description()); if (request.status() != null) entity.setStatus(request.status()); if (request.archived() != null) entity.setArchived(request.archived()); entity.setUpdatedAt(Instant.now()); return projectMapper.toDto(projects.save(entity)); }
    @Override
    public void delete(UUID id) { project(id); tasks.deleteAll(tasks.findByProjectIdOrderByCreatedAtDesc(id)); milestones.deleteAll(milestones.findByProjectIdOrderByNameAsc(id)); resources.deleteAll(resources.findByProjectIdOrderByAddedAtDesc(id)); attachments.deleteAll(attachments.findByProjectIdOrderByUploadedAtDesc(id)); projects.deleteById(id); }
    @Override @Transactional(readOnly = true)
    public List<MilestoneDto> milestones(UUID projectId) { project(projectId); return milestones.findByProjectIdOrderByNameAsc(projectId).stream().map(milestoneMapper::toDto).toList(); }
    @Override
    public MilestoneDto addMilestone(UUID projectId, CreateMilestoneRequest request) { Project project = project(projectId); Milestone entity = new Milestone(projectId, request.name()); project.setUpdatedAt(Instant.now()); projects.save(project); return milestoneMapper.toDto(milestones.save(entity)); }
    @Override
    public MilestoneDto updateMilestone(UUID projectId, UUID milestoneId, RequestModels.MilestonePatch request) { project(projectId); Milestone entity = milestones.findById(milestoneId).filter(item -> item.getProjectId().equals(projectId)).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Milestone not found")); if (request.name() != null) entity.setName(request.name()); if (request.status() != null) entity.setStatus(request.status()); return milestoneMapper.toDto(milestones.save(entity)); }
    @Override @Transactional(readOnly = true)
    public List<ResourceDto> resources(UUID projectId) { project(projectId); return resources.findByProjectIdOrderByAddedAtDesc(projectId).stream().map(resourceMapper::toDto).toList(); }
    @Override
    public ResourceDto addResource(UUID projectId, CreateResourceRequest request) { Project project = project(projectId); Resource entity = new Resource(projectId, request.label(), request.url()); entity.setAddedAt(Instant.now()); project.setUpdatedAt(Instant.now()); projects.save(project); return resourceMapper.toDto(resources.save(entity)); }
    @Override @Transactional(readOnly = true)
    public List<AttachmentDto> attachments(UUID projectId) { project(projectId); return attachments.findByProjectIdOrderByUploadedAtDesc(projectId).stream().map(attachmentMapper::toDto).toList(); }
    @Override
    public AttachmentDto addAttachment(UUID projectId, CreateAttachmentRequest request) { Project project = project(projectId); Attachment entity = new Attachment(projectId, request.name(), request.size()); entity.setUploadedAt(Instant.now()); project.setUpdatedAt(Instant.now()); projects.save(project); return attachmentMapper.toDto(attachments.save(entity)); }
    @Override
    public void deleteMilestone(UUID projectId, UUID milestoneId) { project(projectId); Milestone entity = milestones.findById(milestoneId).filter(item -> item.getProjectId().equals(projectId)).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Milestone not found")); milestones.delete(entity); }
    @Override
    public void deleteResource(UUID projectId, UUID resourceId) { project(projectId); Resource entity = resources.findById(resourceId).filter(item -> item.getProjectId().equals(projectId)).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found")); resources.delete(entity); }
    @Override
    public void deleteAttachment(UUID projectId, UUID attachmentId) { project(projectId); Attachment entity = attachments.findById(attachmentId).filter(item -> item.getProjectId().equals(projectId)).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Attachment not found")); attachments.delete(entity); }
    private Project project(UUID id) { return projects.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found")); }
}
