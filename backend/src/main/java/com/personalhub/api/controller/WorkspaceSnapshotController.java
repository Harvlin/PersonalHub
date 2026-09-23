package com.personalhub.api.controller;

import com.personalhub.api.dto.*;
import com.personalhub.api.repository.*;
import com.personalhub.api.service.SettingsService;
import com.personalhub.api.mapper.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspace")
@RequiredArgsConstructor
public class WorkspaceSnapshotController {
    private final ProjectRepository projects; private final ProjectMapper projectMapper;
    private final MilestoneRepository milestones; private final MilestoneMapper milestoneMapper;
    private final TaskRepository tasks; private final TaskMapper taskMapper;
    private final ContactRepository contacts; private final ContactMapper contactMapper;
    private final InteractionRepository interactions; private final InteractionMapper interactionMapper;
    private final ResourceRepository resources; private final ResourceMapper resourceMapper;
    private final AttachmentRepository attachments; private final AttachmentMapper attachmentMapper;
    private final SettingsService settings;
    @GetMapping @Transactional(readOnly = true)
    public WorkspaceSnapshotDto get() { return new WorkspaceSnapshotDto(projects.findAllByOrderByUpdatedAtDesc().stream().map(projectMapper::toDto).toList(), milestones.findAll().stream().map(milestoneMapper::toDto).toList(), tasks.findAllByOrderByCreatedAtDesc().stream().map(taskMapper::toDto).toList(), contacts.findAllByOrderByNameAsc().stream().map(contactMapper::toDto).toList(), interactions.findAllByOrderByDateDesc().stream().map(interactionMapper::toDto).toList(), resources.findAll().stream().map(resourceMapper::toDto).toList(), attachments.findAll().stream().map(attachmentMapper::toDto).toList(), settings.get()); }
    public record WorkspaceSnapshotDto(List<ProjectDto> projects, List<MilestoneDto> milestones, List<TaskDto> tasks, List<ContactDto> contacts, List<InteractionDto> interactions, List<ResourceDto> resources, List<AttachmentDto> attachments, SettingsDto settings) {}
}
