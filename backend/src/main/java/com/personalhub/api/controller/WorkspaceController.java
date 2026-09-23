package com.personalhub.api.controller;

import com.personalhub.api.dto.SettingsDto;
import com.personalhub.api.dto.UpdateSettingsRequest;
import com.personalhub.api.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class WorkspaceController {
    private final SettingsService service;
    @GetMapping public SettingsDto get() { return service.get(); }
    @PatchMapping public SettingsDto update(@Valid @RequestBody UpdateSettingsRequest request) { return service.update(request); }
}
