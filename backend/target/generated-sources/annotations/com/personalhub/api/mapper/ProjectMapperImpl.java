package com.personalhub.api.mapper;

import com.personalhub.api.dto.CreateProjectRequest;
import com.personalhub.api.dto.ProjectDto;
import com.personalhub.api.dto.RequestModels;
import com.personalhub.api.entity.Project;
import com.personalhub.api.enums.ProjectHealth;
import com.personalhub.api.enums.ProjectLifecycle;
import com.personalhub.api.enums.Status;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-10T23:08:56+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class ProjectMapperImpl implements ProjectMapper {

    @Override
    public ProjectDto toDto(Project entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String description = null;
        Status status = null;
        boolean archived = false;
        ProjectLifecycle lifecycle = null;
        ProjectHealth health = null;
        String blockedReason = null;
        Instant blockedSince = null;
        Instant createdAt = null;
        Instant updatedAt = null;

        id = entity.getId();
        name = entity.getName();
        description = entity.getDescription();
        status = entity.getStatus();
        archived = entity.isArchived();
        lifecycle = entity.getLifecycle();
        health = entity.getHealth();
        blockedReason = entity.getBlockedReason();
        blockedSince = entity.getBlockedSince();
        createdAt = entity.getCreatedAt();
        updatedAt = entity.getUpdatedAt();

        ProjectDto projectDto = new ProjectDto( id, name, description, status, archived, lifecycle, health, blockedReason, blockedSince, createdAt, updatedAt );

        return projectDto;
    }

    @Override
    public Project toEntity(CreateProjectRequest request) {
        if ( request == null ) {
            return null;
        }

        Project project = new Project();

        project.setDescription( request.description() );
        project.setName( request.name() );

        return project;
    }

    @Override
    public void update(Project entity, RequestModels.ProjectPatch request) {
        if ( request == null ) {
            return;
        }

        if ( request.archived() != null ) {
            entity.setArchived( request.archived() );
        }
        entity.setBlockedReason( request.blockedReason() );
        entity.setDescription( request.description() );
        entity.setHealth( request.health() );
        entity.setLifecycle( request.lifecycle() );
        entity.setName( request.name() );
        entity.setStatus( request.status() );
    }
}
