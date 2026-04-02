package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreateMapBlockRequest;
import com.ufam.uforum.dto.response.MapBlockResponse;
import com.ufam.uforum.entity.MapBlock;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.repository.MapBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MapBlockService {

    private final MapBlockRepository mapBlockRepository;

    public List<MapBlockResponse> listAll() {
        return mapBlockRepository.findByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    public List<MapBlockResponse> search(String q) {
        return mapBlockRepository.search(q).stream().map(this::toResponse).toList();
    }

    public MapBlockResponse getById(UUID id) {
        return toResponse(mapBlockRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bloco", id)));
    }

    @Transactional
    public MapBlockResponse create(CreateMapBlockRequest req) {
        MapBlock block = MapBlock.builder()
            .name(req.name())
            .code(req.code())
            .description(req.description())
            .latitude(req.latitude())
            .longitude(req.longitude())
            .polygonCoords(req.polygonCoords())
            .floorCount(req.floorCount() != null ? req.floorCount() : 1)
            .build();
        return toResponse(mapBlockRepository.save(block));
    }

    @Transactional
    public MapBlockResponse update(UUID id, CreateMapBlockRequest req) {
        MapBlock block = mapBlockRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bloco", id));
        
        block.setName(req.name());
        block.setCode(req.code());
        block.setDescription(req.description());
        block.setLatitude(req.latitude());
        block.setLongitude(req.longitude());
        block.setFloorCount(req.floorCount() != null ? req.floorCount() : 1);
        
        return toResponse(mapBlockRepository.save(block));
    }

    @Transactional
    public void delete(UUID id) {
        MapBlock block = mapBlockRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bloco", id));
        block.setIsActive(false);
        mapBlockRepository.save(block);
    }

    private MapBlockResponse toResponse(MapBlock b) {
        return new MapBlockResponse(b.getId(), b.getName(), b.getCode(), b.getDescription(),
            b.getLatitude(), b.getLongitude(), b.getPolygonCoords(), b.getFloorCount());
    }
}
