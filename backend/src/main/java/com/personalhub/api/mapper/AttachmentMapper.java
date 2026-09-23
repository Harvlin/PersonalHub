package com.personalhub.api.mapper;

import com.personalhub.api.dto.AttachmentDto;
import com.personalhub.api.entity.Attachment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttachmentMapper {
    AttachmentDto toDto(Attachment entity);
}
