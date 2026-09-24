package com.personalhub.api.mapper;

import com.personalhub.api.dto.AttachmentDto;
import com.personalhub.api.entity.Attachment;
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
public class AttachmentMapperImpl implements AttachmentMapper {

    @Override
    public AttachmentDto toDto(Attachment entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        UUID projectId = null;
        String name = null;
        String size = null;
        Instant uploadedAt = null;

        id = entity.getId();
        projectId = entity.getProjectId();
        name = entity.getName();
        size = entity.getSize();
        uploadedAt = entity.getUploadedAt();

        AttachmentDto attachmentDto = new AttachmentDto( id, projectId, name, size, uploadedAt );

        return attachmentDto;
    }
}
