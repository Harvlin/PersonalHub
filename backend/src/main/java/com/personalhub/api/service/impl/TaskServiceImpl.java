package com.personalhub.api.service.impl;

import com.personalhub.api.dto.CreateTaskRequest;
import com.personalhub.api.dto.TaskDto;
import com.personalhub.api.entity.Project;
import com.personalhub.api.entity.Task;
import com.personalhub.api.mapper.TaskMapper;
import com.personalhub.api.repository.ProjectRepository;
import com.personalhub.api.repository.TaskRepository;
import com.personalhub.api.service.TaskService;
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
public class TaskServiceImpl implements TaskService {
    private final TaskRepository tasks;
    private final ProjectRepository projects;
    private final TaskMapper mapper;

    @Override @Transactional(readOnly = true)
    public List<TaskDto> findAll() { return tasks.findAllByOrderByCreatedAtDesc().stream().map(mapper::toDto).toList(); }
    @Override @Transactional(readOnly = true)
    public TaskDto findById(UUID id) { return mapper.toDto(task(id)); }
    @Override
    public TaskDto create(CreateTaskRequest request) { touchProject(request.projectId()); Task entity = mapper.toEntity(request); entity.setCreatedAt(Instant.now()); return mapper.toDto(tasks.save(entity)); }
    @Override
    public TaskDto update(UUID id, RequestModels.TaskPatch request) {
        Task entity = task(id);
        if (request.status() == com.personalhub.api.enums.Status.BLOCKED
            && (request.blockedReason() == null || request.blockedReason().isBlank())
            && (entity.getBlockedReason() == null || entity.getBlockedReason().isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "BLOCKED requires blockedReason");
        }
        if (request.title() != null) entity.setTitle(request.title());
        if (request.description() != null) entity.setDescription(request.description());
        if (request.status() != null) entity.setStatus(request.status());
        if (request.blockedReason() != null) entity.setBlockedReason(request.blockedReason());
        if (request.projectId() != null) { entity.setProjectId(request.projectId()); touchProject(request.projectId()); }
        if (request.milestoneId() != null) entity.setMilestoneId(request.milestoneId());
        if (request.due() != null) entity.setDue(request.due());
        if (request.contactId() != null) entity.setContactId(request.contactId());
        return mapper.toDto(tasks.save(entity));
    }
    @Override
    public void delete(UUID id) { tasks.delete(task(id)); }
    private Task task(UUID id) { return tasks.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Task not found")); }
    private void touchProject(UUID id) { Project project = projects.findById(id).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Project not found")); project.setUpdatedAt(Instant.now()); projects.save(project); }
}
