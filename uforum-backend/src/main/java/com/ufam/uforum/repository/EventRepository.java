package com.ufam.uforum.repository;

import com.ufam.uforum.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query(value = "SELECT e FROM Event e JOIN FETCH e.createdBy " +
           "WHERE e.isActive = true AND e.startDate > :now ORDER BY e.startDate ASC",
           countQuery = "SELECT COUNT(e) FROM Event e WHERE e.isActive = true AND e.startDate > :now")
    Page<Event> findByIsActiveTrueAndStartDateAfterOrderByStartDateAsc(LocalDateTime now, Pageable pageable);

    @Query(value = "SELECT e FROM Event e JOIN FETCH e.createdBy " +
           "WHERE e.community.id = :communityId AND e.isActive = true",
           countQuery = "SELECT COUNT(e) FROM Event e WHERE e.community.id = :communityId AND e.isActive = true")
    Page<Event> findByCommunityIdAndIsActiveTrue(UUID communityId, Pageable pageable);

    @Query(value = "SELECT e FROM Event e JOIN FETCH e.createdBy JOIN e.attendees a WHERE a.id = :userId",
           countQuery = "SELECT COUNT(e) FROM Event e JOIN e.attendees a WHERE a.id = :userId")
    Page<Event> findByAttendeeId(UUID userId, Pageable pageable);
}
