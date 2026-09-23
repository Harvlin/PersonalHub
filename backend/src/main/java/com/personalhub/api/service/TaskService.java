package com.personalhub.api.service;

import com.personalhub.api.dto.CreateTaskRequest;
import com.personalhub.api.dto.TaskDto;
import com.personalhub.api.dto.RequestModels;
import java.util.List;
import java.util.UUID;

public interface TaskService {
    List<TaskDto> findAll();
    TaskDto findById(UUID id);
    TaskDto create(CreateTaskRequest request);
    TaskDto update(UUID id, RequestModels.TaskPatch request);
    void delete(UUID id);
}
