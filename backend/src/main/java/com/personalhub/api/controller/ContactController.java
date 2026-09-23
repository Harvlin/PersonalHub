package com.personalhub.api.controller;

import com.personalhub.api.dto.*;
import com.personalhub.api.service.ContactService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService service;
    @GetMapping public List<ContactDto> list() { return service.findAll(); }
    @GetMapping("/{id}") public ContactDto get(@PathVariable UUID id) { return service.findById(id); }
    @PostMapping public ContactDto create(@Valid @RequestBody CreateContactRequest request) { return service.create(request); }
    @PatchMapping("/{id}") public ContactDto update(@PathVariable UUID id, @Valid @RequestBody RequestModels.ContactPatch request) { return service.update(id, request); }
    @GetMapping("/{id}/interactions") public List<InteractionDto> interactions(@PathVariable UUID id) { return service.interactions(id); }
    @PostMapping("/{id}/interactions") public InteractionDto addInteraction(@PathVariable UUID id, @Valid @RequestBody CreateInteractionRequest request) { return service.addInteraction(id, request); }
}
