package com.personalhub.api.controller;

import com.personalhub.api.dto.CreateTaskRequest;
import com.personalhub.api.dto.RequestModels;
import com.personalhub.api.dto.TaskDto;
import com.personalhub.api.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService service;
    @GetMapping public List<TaskDto> list() { return service.findAll(); }
    @GetMapping("/{id}") public TaskDto get(@PathVariable UUID id) { return service.findById(id); }
    @PostMapping public TaskDto create(@Valid @RequestBody CreateTaskRequest request) { return service.create(request); }
    @PatchMapping("/{id}") public TaskDto update(@PathVariable UUID id, @Valid @RequestBody RequestModels.TaskPatch request) { return service.update(id, request); }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { service.delete(id); }
}
