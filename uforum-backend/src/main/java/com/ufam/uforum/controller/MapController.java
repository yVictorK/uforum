package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.CreateMapBlockRequest;
import com.ufam.uforum.dto.response.MapBlockResponse;
import com.ufam.uforum.service.MapBlockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
@Tag(name = "Mapa UFAM")
public class MapController {

    private final MapBlockService mapBlockService;

    @GetMapping("/blocks")
    @Operation(summary = "Listar todos os blocos do campus")
    public List<MapBlockResponse> listBlocks(@RequestParam(required = false) String q) {
        return q != null ? mapBlockService.search(q) : mapBlockService.listAll();
    }

    @GetMapping("/blocks/{id}")
    @Operation(summary = "Detalhes de um bloco")
    public MapBlockResponse getBlock(@PathVariable UUID id) {
        return mapBlockService.getById(id);
    }

    @PostMapping("/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Adicionar bloco ao mapa (ADMIN)")
    public MapBlockResponse createBlock(@Valid @RequestBody CreateMapBlockRequest req) {
        return mapBlockService.create(req);
    }
}
