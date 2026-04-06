package com.ufam.uforum.repository;

import com.ufam.uforum.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findAllByFloorId(UUID floorId);
    void deleteAllByFloorId(UUID floorId);

    @Query("SELECT r FROM Room r JOIN r.floor f JOIN f.mapBlock b " +
           "WHERE b.isActive = true AND (" +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(r.number) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Room> searchRooms(@Param("q") String query);
}
