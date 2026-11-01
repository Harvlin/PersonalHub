package com.personalhub.api.mapper;

import com.personalhub.api.dto.InteractionDto;
import com.personalhub.api.entity.Interaction;
import java.time.LocalDate;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-11-01T22:36:53+0700",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.200.v20261008-1115, environment: Java 25.0.4.1 (Eclipse Adoptium)"
)
@Component
public class InteractionMapperImpl implements InteractionMapper {

    @Override
    public InteractionDto toDto(Interaction entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        UUID contactId = null;
        LocalDate date = null;
        String note = null;

        id = entity.getId();
        contactId = entity.getContactId();
        date = entity.getDate();
        note = entity.getNote();

        InteractionDto interactionDto = new InteractionDto( id, contactId, date, note );

        return interactionDto;
    }
}
