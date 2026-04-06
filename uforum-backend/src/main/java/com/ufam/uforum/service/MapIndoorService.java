package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreateFloorRequest;
import com.ufam.uforum.dto.request.CreateRoomRequest;
import com.ufam.uforum.dto.response.FloorResponse;
import com.ufam.uforum.dto.response.RoomResponse;
import com.ufam.uforum.entity.Floor;
import com.ufam.uforum.entity.MapBlock;
import com.ufam.uforum.entity.Room;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.repository.FloorRepository;
import com.ufam.uforum.repository.MapBlockRepository;
import com.ufam.uforum.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MapIndoorService {

    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final MapBlockRepository mapBlockRepository;

    public List<FloorResponse> getFloorsByBlock(UUID blockId) {
        return floorRepository.findAllByMapBlockIdOrderByNumberAsc(blockId)
                .stream().map(this::toFloorResponse).collect(Collectors.toList());
    }

    public FloorResponse getFloor(UUID floorId) {
        return toFloorResponse(floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Andar", floorId)));
    }

    public List<RoomResponse> getRoomsByFloor(UUID floorId) {
        return roomRepository.findAllByFloorId(floorId)
                .stream().map(this::toRoomResponse).collect(Collectors.toList());
    }

    public List<RoomResponse> searchRooms(String q) {
        return roomRepository.searchRooms(q)
                .stream().map(this::toRoomResponse).collect(Collectors.toList());
    }

    @Transactional
    public FloorResponse createFloor(CreateFloorRequest req) {
        MapBlock block = mapBlockRepository.findById(req.getBlockId())
                .orElseThrow(() -> new ResourceNotFoundException("Bloco", req.getBlockId()));

        Floor floor = Floor.builder()
                .mapBlock(block)
                .number(req.getNumber())
                .name(req.getName())
                .build();
        floor = floorRepository.save(floor);

        // Sync floorCount
        long total = floorRepository.findAllByMapBlockIdOrderByNumberAsc(block.getId()).size();
        block.setFloorCount((int) total);
        mapBlockRepository.save(block);

        return toFloorResponse(floor);
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest req) {
        Floor floor = floorRepository.findById(req.getFloorId())
                .orElseThrow(() -> new ResourceNotFoundException("Andar", req.getFloorId()));

        Room room = Room.builder()
                .floor(floor)
                .name(req.getName())
                .number(req.getNumber())
                .type(req.getType())
                .x(req.getX())
                .y(req.getY())
                .width(req.getWidth())
                .height(req.getHeight())
                .metadata(req.getMetadata())
                .build();

        return toRoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse updateRoom(UUID id, com.ufam.uforum.dto.request.UpdateRoomRequest req) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Sala", id));
        room.setName(req.name());
        room.setNumber(req.number());
        room.setType(req.type());
        return toRoomResponse(roomRepository.save(room));
    }

    @Transactional
    public void deleteFloor(UUID id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Andar", id));
        MapBlock block = floor.getMapBlock();
        roomRepository.deleteAllByFloorId(id);
        floorRepository.delete(floor);
        // Sync floorCount
        long remaining = floorRepository.findAllByMapBlockIdOrderByNumberAsc(block.getId()).size();
        block.setFloorCount((int) remaining);
        mapBlockRepository.save(block);
    }

    @Transactional
    public void deleteRoom(UUID id) {
        Room target = roomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Sala", id));
        Floor floor = target.getFloor();
        roomRepository.delete(target);

        // Auto-recalculate layout for remaining rooms
        List<Room> remainingRooms = roomRepository.findAllByFloorId(floor.getId());
        if (!remainingRooms.isEmpty()) {
            remainingRooms.sort((r1, r2) -> Double.compare(r1.getX(), r2.getX()));
            double roomWidth = 1000.0 / remainingRooms.size();
            for (int i = 0; i < remainingRooms.size(); i++) {
                Room r = remainingRooms.get(i);
                r.setX(i * roomWidth);
                r.setWidth(roomWidth);
                roomRepository.save(r);
            }
        }
    }

    private FloorResponse toFloorResponse(Floor f) {
        return FloorResponse.builder()
                .id(f.getId())
                .blockId(f.getMapBlock().getId())
                .number(f.getNumber())
                .name(f.getName())
                .rooms(f.getRooms().stream().map(this::toRoomResponse).collect(Collectors.toList()))
                .build();
    }

    private RoomResponse toRoomResponse(Room r) {
        return RoomResponse.builder()
                .id(r.getId())
                .floorId(r.getFloor().getId())
                .blockId(r.getFloor().getMapBlock().getId())
                .blockName(r.getFloor().getMapBlock().getName())
                .blockCode(r.getFloor().getMapBlock().getCode())
                .floorNumber(r.getFloor().getNumber())
                .name(r.getName())
                .number(r.getNumber())
                .type(r.getType())
                .x(r.getX())
                .y(r.getY())
                .width(r.getWidth())
                .height(r.getHeight())
                .metadata(r.getMetadata())
                .build();
    }
}
