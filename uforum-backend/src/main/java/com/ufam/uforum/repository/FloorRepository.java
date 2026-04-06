package com.ufam.uforum.repository;

import com.ufam.uforum.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FloorRepository extends JpaRepository<Floor, UUID> {
    List<Floor> findAllByMapBlockIdOrderByNumberAsc(UUID blockId);
}
