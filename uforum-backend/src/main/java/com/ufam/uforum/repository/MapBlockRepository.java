package com.ufam.uforum.repository;

import com.ufam.uforum.entity.MapBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MapBlockRepository extends JpaRepository<MapBlock, UUID> {
    List<MapBlock> findByIsActiveTrue();

    @Query("SELECT b FROM MapBlock b WHERE b.isActive = true AND " +
           "(LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(b.code) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<MapBlock> search(String q);
}
