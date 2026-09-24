package com.personalhub.api.mapper;

import com.personalhub.api.dto.MilestoneDto;
import com.personalhub.api.entity.Milestone;
import com.personalhub.api.enums.Status;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-24T08:57:55+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class MilestoneMapperImpl implements MilestoneMapper {

    @Override
    public MilestoneDto toDto(Milestone entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        UUID projectId = null;
        String name = null;
        Status status = null;

        id = entity.getId();
        projectId = entity.getProjectId();
        name = entity.getName();
        status = entity.getStatus();

        MilestoneDto milestoneDto = new MilestoneDto( id, projectId, name, status );

        return milestoneDto;
    }
}
