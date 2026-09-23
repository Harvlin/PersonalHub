package com.personalhub.api.mapper;

import com.personalhub.api.dto.CreateTaskRequest;
import com.personalhub.api.dto.TaskDto;
import com.personalhub.api.entity.Task;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaskMapper {
    TaskDto toDto(Task entity);
    Task toEntity(CreateTaskRequest request);
}
