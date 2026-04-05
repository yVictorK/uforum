package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.CreateEventRequest;
import com.ufam.uforum.dto.response.EventResponse;
import com.ufam.uforum.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Eventos")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @Operation(summary = "Listar próximos eventos")
    public Page<EventResponse> list(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return eventService.listUpcoming(q, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhes de um evento")
    public EventResponse getById(@PathVariable UUID id) {
        return eventService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('EVENT_MANAGER','ADMIN')")
    @Operation(summary = "Criar evento (requer permissão EVENT_MANAGER ou ADMIN)")
    public EventResponse create(@Valid @RequestBody CreateEventRequest req) {
        return eventService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EVENT_MANAGER','ADMIN')")
    @Operation(summary = "Atualizar informações de um evento (requer permissão EVENT_MANAGER ou ADMIN)")
    public EventResponse update(@PathVariable UUID id, @Valid @RequestBody CreateEventRequest req) {
        return eventService.update(id, req);
    }

    @PostMapping("/{id}/attend")
    @Operation(summary = "Confirmar / cancelar presença em um evento")
    public EventResponse toggleAttendance(@PathVariable UUID id) {
        return eventService.toggleAttendance(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('EVENT_MANAGER','ADMIN')")
    @Operation(summary = "Excluir evento")
    public void delete(@PathVariable UUID id) {
        eventService.delete(id);
    }
}
