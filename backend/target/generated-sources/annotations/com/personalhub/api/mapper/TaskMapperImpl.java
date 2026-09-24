package com.personalhub.api.mapper;

import com.personalhub.api.dto.CreateTaskRequest;
import com.personalhub.api.dto.TaskDto;
import com.personalhub.api.entity.Task;
import com.personalhub.api.enums.Status;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-24T08:57:55+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class TaskMapperImpl implements TaskMapper {

    @Override
    public TaskDto toDto(Task entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        String title = null;
        String description = null;
        Status status = null;
        String blockedReason = null;
        UUID projectId = null;
        UUID milestoneId = null;
        LocalDate due = null;
        Instant createdAt = null;
        UUID contactId = null;

        id = entity.getId();
        title = entity.getTitle();
        description = entity.getDescription();
        status = entity.getStatus();
        blockedReason = entity.getBlockedReason();
        projectId = entity.getProjectId();
        milestoneId = entity.getMilestoneId();
        due = entity.getDue();
        createdAt = entity.getCreatedAt();
        contactId = entity.getContactId();

        TaskDto taskDto = new TaskDto( id, title, description, status, blockedReason, projectId, milestoneId, due, createdAt, contactId );

        return taskDto;
    }

    @Override
    public Task toEntity(CreateTaskRequest request) {
        if ( request == null ) {
            return null;
        }

        Task task = new Task();

        task.setContactId( request.contactId() );
        task.setDescription( request.description() );
        task.setDue( request.due() );
        task.setMilestoneId( request.milestoneId() );
        task.setProjectId( request.projectId() );
        task.setTitle( request.title() );

        return task;
    }
}
