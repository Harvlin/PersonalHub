package com.personalhub.api.mapper;

import com.personalhub.api.dto.CreateProjectRequest;
import com.personalhub.api.dto.ProjectDto;
import com.personalhub.api.dto.RequestModels;
import com.personalhub.api.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    ProjectDto toDto(Project entity);
    Project toEntity(CreateProjectRequest request);
    void update(@MappingTarget Project entity, RequestModels.ProjectPatch request);
}
