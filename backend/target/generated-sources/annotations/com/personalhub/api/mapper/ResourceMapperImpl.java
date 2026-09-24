package com.personalhub.api.mapper;

import com.personalhub.api.dto.ResourceDto;
import com.personalhub.api.entity.Resource;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-24T08:57:55+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class ResourceMapperImpl implements ResourceMapper {

    @Override
    public ResourceDto toDto(Resource entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        UUID projectId = null;
        String label = null;
        String url = null;
        Instant addedAt = null;

        id = entity.getId();
        projectId = entity.getProjectId();
        label = entity.getLabel();
        url = entity.getUrl();
        addedAt = entity.getAddedAt();

        ResourceDto resourceDto = new ResourceDto( id, projectId, label, url, addedAt );

        return resourceDto;
    }
}
