package com.ufam.uforum.repository;

import com.ufam.uforum.entity.Report;
import com.ufam.uforum.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    boolean existsByReporterIdAndTargetId(UUID reporterId, UUID targetId);
}
