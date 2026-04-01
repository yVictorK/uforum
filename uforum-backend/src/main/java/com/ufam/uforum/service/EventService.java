package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreateEventRequest;
import com.ufam.uforum.dto.response.EventResponse;
import com.ufam.uforum.entity.Event;
import com.ufam.uforum.entity.MapBlock;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.exception.UnauthorizedException;
import com.ufam.uforum.repository.CommunityRepository;
import com.ufam.uforum.repository.EventRepository;
import com.ufam.uforum.repository.MapBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final MapBlockRepository mapBlockRepository;
    private final CommunityRepository communityRepository;
    private final UserService userService;

    public Page<EventResponse> listUpcoming(Pageable pageable) {
        User current = safeGetCurrentUser();
        return eventRepository.findByIsActiveTrueAndStartDateAfterOrderByStartDateAsc(
            LocalDateTime.now(), pageable).map(e -> toResponse(e, current));
    }

    public EventResponse getById(UUID id) {
        User current = safeGetCurrentUser();
        Event event = findOrThrow(id);
        return toResponse(event, current);
    }

    public Page<EventResponse> getByCommunity(UUID communityId, Pageable pageable) {
        User current = safeGetCurrentUser();
        return eventRepository.findByCommunityIdAndIsActiveTrue(communityId, pageable)
            .map(e -> toResponse(e, current));
    }

    public Page<EventResponse> getMyEvents(Pageable pageable) {
        User current = userService.getCurrentUser();
        return eventRepository.findByAttendeeId(current.getId(), pageable)
            .map(e -> toResponse(e, current));
    }

    @Transactional
    public EventResponse create(CreateEventRequest req) {
        User current = userService.getCurrentUser();

        if (req.endDate() != null && req.endDate().isBefore(req.startDate()))
            throw new BusinessException("Data de término deve ser após a data de início");

        Event event = Event.builder()
            .title(req.title())
            .description(req.description())
            .imageUrl(req.imageUrl())
            .location(req.location())
            .mapBlockId(req.mapBlockId())
            .startDate(req.startDate())
            .endDate(req.endDate())
            .createdBy(current)
            .build();

        // FIX: communityId is a UUID — use communityRepository.findById() not findBySlug()
        if (req.communityId() != null) {
            event.setCommunity(
                communityRepository.findById(req.communityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comunidade", req.communityId()))
            );
        }

        return toResponse(eventRepository.save(event), current);
    }

    @Transactional
    public EventResponse toggleAttendance(UUID eventId) {
        User current = userService.getCurrentUser();
        Event event = findOrThrow(eventId);

        if (event.getStartDate().isBefore(LocalDateTime.now()))
            throw new BusinessException("Não é possível confirmar presença em eventos já encerrados");

        if (event.getAttendees().contains(current)) {
            event.getAttendees().remove(current);
        } else {
            event.getAttendees().add(current);
        }

        return toResponse(eventRepository.save(event), current);
    }

    @Transactional
    public void delete(UUID eventId) {
        User current = userService.getCurrentUser();
        Event event = findOrThrow(eventId);

        boolean isCreator = event.getCreatedBy().getId().equals(current.getId());
        boolean isAdmin = current.getRole().name().equals("ADMIN");

        if (!isCreator && !isAdmin)
            throw new UnauthorizedException("Sem permissão para excluir este evento");

        event.setIsActive(false);
        eventRepository.save(event);
    }

    private Event findOrThrow(UUID id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Evento", id));
    }

    private User safeGetCurrentUser() {
        try { return userService.getCurrentUser(); }
        catch (ResourceNotFoundException | org.springframework.security.core.AuthenticationException e) { return null; }
    }

    public EventResponse toResponse(Event e, User currentUser) {
        boolean isAttending = currentUser != null &&
            e.getAttendees().stream().anyMatch(a -> a.getId().equals(currentUser.getId()));

        String blockName = null;
        if (e.getMapBlockId() != null) {
            blockName = mapBlockRepository.findById(e.getMapBlockId())
                .map(MapBlock::getName).orElse(null);
        }

        return new EventResponse(
            e.getId(), e.getTitle(), e.getDescription(), e.getImageUrl(),
            e.getLocation(), e.getMapBlockId(), blockName,
            e.getStartDate(), e.getEndDate(),
            e.getAttendeesCount(), isAttending,
            userService.toSummary(e.getCreatedBy()),
            e.getCommunity() != null ? e.getCommunity().getId() : null,
            e.getCreatedAt()
        );
    }
}
