package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreateMapBlockRequest;
import com.ufam.uforum.dto.response.MapBlockResponse;
import com.ufam.uforum.entity.MapBlock;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.repository.MapBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import com.ufam.uforum.entity.Floor;
import com.ufam.uforum.entity.Room;
import com.ufam.uforum.enums.RoomType;
import com.ufam.uforum.repository.FloorRepository;
import com.ufam.uforum.repository.RoomRepository;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MapBlockService {

    private final MapBlockRepository mapBlockRepository;
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;

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
        block = mapBlockRepository.save(block);

        int fCount = block.getFloorCount();
        int rCount = req.roomsPerFloor() != null ? req.roomsPerFloor() : 0;

        for (int f = 1; f <= fCount; f++) {
            Floor floor = Floor.builder()
                .mapBlock(block)
                .number(f)
                .name(f + "º Andar")
                .build();
            floor = floorRepository.save(floor);

            if (rCount > 0) {
                double totalWidth = 1000.0;
                double roomWidth = totalWidth / rCount;
                for (int r = 1; r <= rCount; r++) {
                    Room room = Room.builder()
                        .floor(floor)
                        .name("Sala " + (f * 100 + r))
                        .number(String.valueOf(f * 100 + r))
                        .type(RoomType.CLASSROOM)
                        .x((r - 1) * roomWidth)
                        .y(100.0) // keep it vertically centered inside generation
                        .width(roomWidth)
                        .height(100.0) // fixed wide horizontal shape
                        .build();
                    roomRepository.save(room);
                }
            }
        }
        return toResponse(block);
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

        int requestedFloors = req.floorCount() != null ? req.floorCount() : 1;
        List<Floor> existingFloors = floorRepository.findAllByMapBlockIdOrderByNumberAsc(id);
        int currentCount = existingFloors.size();

        if (requestedFloors > currentCount) {
            int rCount = req.roomsPerFloor() != null ? req.roomsPerFloor() : 0;
            for (int f = currentCount + 1; f <= requestedFloors; f++) {
                Floor floor = Floor.builder()
                    .mapBlock(block)
                    .number(f)
                    .name(f + "º Andar")
                    .build();
                floor = floorRepository.save(floor);

                if (rCount > 0) {
                    double totalWidth = 1000.0;
                    double roomWidth = totalWidth / rCount;
                    for (int r = 1; r <= rCount; r++) {
                        Room room = Room.builder()
                            .floor(floor)
                            .name("Sala " + (f * 100 + r))
                            .number(String.valueOf(f * 100 + r))
                            .type(com.ufam.uforum.enums.RoomType.CLASSROOM)
                            .x((r - 1) * roomWidth)
                            .y(100.0)
                            .width(roomWidth)
                            .height(100.0)
                            .build();
                        roomRepository.save(room);
                    }
                }
            }
        } else if (requestedFloors < currentCount) {
            List<Floor> toRemove = existingFloors.subList(requestedFloors, currentCount);
            for (Floor f : toRemove) {
                roomRepository.deleteAllByFloorId(f.getId());
                floorRepository.delete(f);
            }
        }

        block.setFloorCount(requestedFloors);
        return toResponse(mapBlockRepository.save(block));
    }

    @Transactional
    public void delete(UUID id) {
        MapBlock block = mapBlockRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bloco", id));
        block.setIsActive(false);
        block.setCode(block.getCode() + "_DEL_" + System.currentTimeMillis());
        mapBlockRepository.save(block);
    }

    private MapBlockResponse toResponse(MapBlock b) {
        return new MapBlockResponse(b.getId(), b.getName(), b.getCode(), b.getDescription(),
            b.getLatitude(), b.getLongitude(), b.getPolygonCoords(), b.getFloorCount());
    }
}
