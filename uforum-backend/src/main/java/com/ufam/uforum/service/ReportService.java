package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreateReportRequest;
import com.ufam.uforum.dto.response.ReportResponse;
import com.ufam.uforum.entity.Report;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.enums.ReportReason;
import com.ufam.uforum.enums.ReportStatus;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserService userService;

    @Transactional
    public void create(CreateReportRequest req) {
        User current = userService.getCurrentUser();

        if (reportRepository.existsByReporterIdAndTargetId(current.getId(), req.targetId()))
            throw new BusinessException("Você já denunciou este conteúdo");

        Report report = Report.builder()
            .reporter(current)
            .targetId(req.targetId())
            .targetType(req.targetType().toUpperCase())
            .reason(ReportReason.valueOf(req.reason().toUpperCase()))
            .description(req.description())
            .build();

        reportRepository.save(report);
    }

    public Page<ReportResponse> listPending(Pageable pageable) {
        return reportRepository.findByStatus(ReportStatus.PENDING, pageable)
            .map(this::toResponse);
    }

    @Transactional
    public void resolve(UUID reportId, String notes, String status) {
        User current = userService.getCurrentUser();
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("Denúncia", reportId));

        report.setStatus(ReportStatus.valueOf(status.toUpperCase()));
        report.setReviewedBy(current);
        report.setReviewerNotes(notes);
        reportRepository.save(report);
    }

    private ReportResponse toResponse(Report r) {
        return new ReportResponse(
            r.getId(),
            userService.toSummary(r.getReporter()),
            r.getTargetId(),
            r.getTargetType(),
            r.getReason().name(),
            r.getDescription(),
            r.getStatus().name(),
            r.getReviewedBy() != null ? userService.toSummary(r.getReviewedBy()) : null,
            r.getReviewerNotes(),
            r.getCreatedAt()
        );
    }
}

