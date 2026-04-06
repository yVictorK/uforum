package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.CreateFloorRequest;
import com.ufam.uforum.dto.request.CreateMapBlockRequest;
import com.ufam.uforum.dto.request.CreateRoomRequest;
import com.ufam.uforum.dto.response.FloorResponse;
import com.ufam.uforum.dto.response.MapBlockResponse;
import com.ufam.uforum.dto.response.RoomResponse;
import com.ufam.uforum.service.MapBlockService;
import com.ufam.uforum.service.MapIndoorService;
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
    private final MapIndoorService mapIndoorService;

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

    @PutMapping("/blocks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar bloco no mapa (ADMIN)")
    public MapBlockResponse updateBlock(@PathVariable UUID id, @Valid @RequestBody CreateMapBlockRequest req) {
        return mapBlockService.update(id, req);
    }

    @DeleteMapping("/blocks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remover bloco do mapa (ADMIN)")
    public void deleteBlock(@PathVariable UUID id) {
        mapBlockService.delete(id);
    }

    // ============================================================
    //  Floors
    // ============================================================

    @GetMapping("/blocks/{id}/floors")
    @Operation(summary = "Listar andares de um bloco")
    public List<FloorResponse> listFloors(@PathVariable UUID id) {
        return mapIndoorService.getFloorsByBlock(id);
    }

    @GetMapping("/floors/{id}")
    @Operation(summary = "Detalhes de um andar")
    public FloorResponse getFloor(@PathVariable UUID id) {
        return mapIndoorService.getFloor(id);
    }

    @PostMapping("/floors")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar novo andar (ADMIN)")
    public FloorResponse createFloor(@Valid @RequestBody CreateFloorRequest req) {
        return mapIndoorService.createFloor(req);
    }

    @DeleteMapping("/floors/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar andar (ADMIN)")
    public void deleteFloor(@PathVariable UUID id) {
        mapIndoorService.deleteFloor(id);
    }

    // ============================================================
    //  Rooms
    // ============================================================

    @GetMapping("/floors/{id}/rooms")
    @Operation(summary = "Listar salas de um andar")
    public List<RoomResponse> listRooms(@PathVariable UUID id) {
        return mapIndoorService.getRoomsByFloor(id);
    }

    @PostMapping("/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar nova sala (ADMIN)")
    public RoomResponse createRoom(@Valid @RequestBody CreateRoomRequest req) {
        return mapIndoorService.createRoom(req);
    }

    @PutMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar detalhes de uma sala (ADMIN)")
    public RoomResponse updateRoom(@PathVariable UUID id, @Valid @RequestBody com.ufam.uforum.dto.request.UpdateRoomRequest req) {
        return mapIndoorService.updateRoom(id, req);
    }

    @DeleteMapping("/rooms/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar sala (ADMIN)")
    public void deleteRoom(@PathVariable UUID id) {
        mapIndoorService.deleteRoom(id);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar salas por nome, número ou bloco")
    public List<RoomResponse> searchRooms(@RequestParam String q) {
        return mapIndoorService.searchRooms(q);
    }
}
