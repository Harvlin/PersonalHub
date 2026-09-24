package com.personalhub.api.service;

import com.personalhub.api.dto.ContactDto;
import com.personalhub.api.dto.CreateContactRequest;
import com.personalhub.api.dto.CreateInteractionRequest;
import com.personalhub.api.dto.InteractionDto;
import com.personalhub.api.dto.RequestModels;
import java.util.List;
import java.util.UUID;

public interface ContactService {
    List<ContactDto> findAll();
    ContactDto findById(UUID id);
    ContactDto create(CreateContactRequest request);
    ContactDto update(UUID id, RequestModels.ContactPatch request);
    void delete(UUID id);
    List<InteractionDto> interactions(UUID id);
    InteractionDto addInteraction(UUID id, CreateInteractionRequest request);
    void deleteInteraction(UUID contactId, UUID interactionId);
}
