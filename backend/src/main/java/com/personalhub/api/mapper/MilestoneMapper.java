package com.personalhub.api.mapper;

import com.personalhub.api.dto.MilestoneDto;
import com.personalhub.api.entity.Milestone;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MilestoneMapper {
    MilestoneDto toDto(Milestone entity);
}
