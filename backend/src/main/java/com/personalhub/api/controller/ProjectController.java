package com.personalhub.api.controller;

import com.personalhub.api.dto.*;
import com.personalhub.api.service.ProjectService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService service;
    @GetMapping public List<ProjectDto> list() { return service.findAll(); }
    @GetMapping("/{id}") public ProjectDto get(@PathVariable UUID id) { return service.findById(id); }
    @PostMapping public ProjectDto create(@Valid @RequestBody CreateProjectRequest request) { return service.create(request); }
    @PatchMapping("/{id}") public ProjectDto update(@PathVariable UUID id, @Valid @RequestBody RequestModels.ProjectPatch request) { return service.update(id, request); }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { service.delete(id); }
    @GetMapping("/{projectId}/milestones") public List<MilestoneDto> milestones(@PathVariable UUID projectId) { return service.milestones(projectId); }
    @PostMapping("/{projectId}/milestones") public MilestoneDto addMilestone(@PathVariable UUID projectId, @Valid @RequestBody CreateMilestoneRequest request) { return service.addMilestone(projectId, request); }
    @PatchMapping("/{projectId}/milestones/{milestoneId}") public MilestoneDto updateMilestone(@PathVariable UUID projectId, @PathVariable UUID milestoneId, @Valid @RequestBody RequestModels.MilestonePatch request) { return service.updateMilestone(projectId, milestoneId, request); }
    @DeleteMapping("/{projectId}/milestones/{milestoneId}") public void deleteMilestone(@PathVariable UUID projectId, @PathVariable UUID milestoneId) { service.deleteMilestone(projectId, milestoneId); }
    @GetMapping("/{projectId}/resources") public List<ResourceDto> resources(@PathVariable UUID projectId) { return service.resources(projectId); }
    @PostMapping("/{projectId}/resources") public ResourceDto addResource(@PathVariable UUID projectId, @Valid @RequestBody CreateResourceRequest request) { return service.addResource(projectId, request); }
    @DeleteMapping("/{projectId}/resources/{resourceId}") public void deleteResource(@PathVariable UUID projectId, @PathVariable UUID resourceId) { service.deleteResource(projectId, resourceId); }
    @GetMapping("/{projectId}/attachments") public List<AttachmentDto> attachments(@PathVariable UUID projectId) { return service.attachments(projectId); }
    @PostMapping("/{projectId}/attachments") public AttachmentDto addAttachment(@PathVariable UUID projectId, @Valid @RequestBody CreateAttachmentRequest request) { return service.addAttachment(projectId, request); }
    @DeleteMapping("/{projectId}/attachments/{attachmentId}") public void deleteAttachment(@PathVariable UUID projectId, @PathVariable UUID attachmentId) { service.deleteAttachment(projectId, attachmentId); }
}
