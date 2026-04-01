package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.CreateReportRequest;
import com.ufam.uforum.dto.response.ReportResponse;
import com.ufam.uforum.service.ReportService;
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
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Denúncias")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Denunciar um post ou usuário")
    public void create(@Valid @RequestBody CreateReportRequest req) {
        reportService.create(req);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
    @Operation(summary = "Listar denúncias pendentes (MODERATOR/ADMIN)")
    public Page<ReportResponse> listPending(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return reportService.listPending(PageRequest.of(page, size));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
    @Operation(summary = "Resolver uma denúncia")
    public void resolve(@PathVariable UUID id,
        @RequestParam String status,
        @RequestParam(required = false) String notes) {
        reportService.resolve(id, notes, status);
    }
}
