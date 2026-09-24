package com.personalhub.api.mapper;

import com.personalhub.api.dto.ContactDto;
import com.personalhub.api.dto.CreateContactRequest;
import com.personalhub.api.entity.Contact;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-24T08:57:55+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class ContactMapperImpl implements ContactMapper {

    @Override
    public ContactDto toDto(Contact entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String originContext = null;
        List<String> tags = null;
        int pingIntervalDays = 0;
        LocalDate lastContact = null;
        String notes = null;

        id = entity.getId();
        name = entity.getName();
        originContext = entity.getOriginContext();
        List<String> list = entity.getTags();
        if ( list != null ) {
            tags = new ArrayList<String>( list );
        }
        pingIntervalDays = entity.getPingIntervalDays();
        lastContact = entity.getLastContact();
        notes = entity.getNotes();

        ContactDto contactDto = new ContactDto( id, name, originContext, tags, pingIntervalDays, lastContact, notes );

        return contactDto;
    }

    @Override
    public Contact toEntity(CreateContactRequest request) {
        if ( request == null ) {
            return null;
        }

        Contact contact = new Contact();

        contact.setName( request.name() );
        contact.setOriginContext( request.originContext() );
        if ( request.pingIntervalDays() != null ) {
            contact.setPingIntervalDays( request.pingIntervalDays() );
        }
        List<String> list = request.tags();
        if ( list != null ) {
            contact.setTags( new ArrayList<String>( list ) );
        }

        return contact;
    }
}
