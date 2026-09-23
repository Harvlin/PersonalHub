package com.personalhub.api.service.impl;

import com.personalhub.api.dto.*;
import com.personalhub.api.entity.Contact;
import com.personalhub.api.entity.Interaction;
import com.personalhub.api.mapper.ContactMapper;
import com.personalhub.api.mapper.InteractionMapper;
import com.personalhub.api.repository.ContactRepository;
import com.personalhub.api.repository.InteractionRepository;
import com.personalhub.api.service.ContactService;
import com.personalhub.api.web.ApiException;
import com.personalhub.api.dto.RequestModels;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactServiceImpl implements ContactService {
    private final ContactRepository contacts;
    private final InteractionRepository interactions;
    private final ContactMapper contactMapper;
    private final InteractionMapper interactionMapper;

    @Override @Transactional(readOnly = true)
    public List<ContactDto> findAll() { return contacts.findAllByOrderByNameAsc().stream().map(contactMapper::toDto).toList(); }
    @Override @Transactional(readOnly = true)
    public ContactDto findById(UUID id) { return contactMapper.toDto(contact(id)); }
    @Override
    public ContactDto create(CreateContactRequest request) { Contact entity = contactMapper.toEntity(request); if (request.pingIntervalDays() == null) entity.setPingIntervalDays(21); entity.setLastContact(LocalDate.now()); return contactMapper.toDto(contacts.save(entity)); }
    @Override
    public ContactDto update(UUID id, RequestModels.ContactPatch request) { Contact entity = contact(id); if (request.name() != null) entity.setName(request.name()); if (request.originContext() != null) entity.setOriginContext(request.originContext()); if (request.tags() != null) entity.setTags(request.tags()); if (request.pingIntervalDays() != null) entity.setPingIntervalDays(request.pingIntervalDays()); if (request.lastContact() != null) entity.setLastContact(request.lastContact()); return contactMapper.toDto(contacts.save(entity)); }
    @Override @Transactional(readOnly = true)
    public List<InteractionDto> interactions(UUID id) { contact(id); return interactions.findByContactIdOrderByDateDesc(id).stream().map(interactionMapper::toDto).toList(); }
    @Override
    public InteractionDto addInteraction(UUID id, CreateInteractionRequest request) { Contact contact = contact(id); Interaction entity = new Interaction(id, request.date(), request.note()); contact.setLastContact(request.date()); contacts.save(contact); return interactionMapper.toDto(interactions.save(entity)); }
    private Contact contact(UUID id) { return contacts.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Contact not found")); }
}
