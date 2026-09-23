package com.personalhub.api.mapper;

import com.personalhub.api.dto.ResourceDto;
import com.personalhub.api.entity.Resource;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ResourceMapper {
    ResourceDto toDto(Resource entity);
}
