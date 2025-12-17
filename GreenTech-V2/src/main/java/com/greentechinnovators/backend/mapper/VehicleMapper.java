package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.request.VehicleRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleResponseDTO;
import com.greentechinnovators.backend.entity.Vehicle;
import com.greentechinnovators.backend.entity.VehicleLog;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class VehicleMapper {

    // ========================================================================
    // 1. Vehicle Mappings
    // ========================================================================

    /**
     * Converts RequestDTO to Entity.
     * NOTE: The 'User' entity is NOT set here. The Service must fetch the User
     * by dto.getUserId() and call vehicle.setUser(user).
     */
    public Vehicle toVehicle(VehicleRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setModel(dto.getModel());
        vehicle.setLongitude(dto.getLonge());
        vehicle.setLongitude(dto.getLat());


        // User lookup is the responsibility of the Service layer
        return vehicle;
    }

    public VehicleResponseDTO toVehicleResponse(Vehicle entity) {
        if (entity == null) {
            return null;
        }

        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(entity.getId());
        dto.setLicensePlate(entity.getLicensePlate());
        dto.setModel(entity.getModel());
        dto.setLastSignalTime(entity.getLastSignalTime());
        dto.setLat(entity.getLatitude());
        dto.setLonge(entity.getLongitude());

        // Extract User ID safely
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
        }

        return dto;
    }

    // ========================================================================
    // 2. Vehicle Log Mappings
    // ========================================================================

    /**
     * Converts Log Request to Entity.
     * NOTE: The Service must fetch the Vehicle by dto.getVehicleId()
     * and call log.setVehicle(vehicle).
     */
    public VehicleLog toVehicleLog(VehicleLogRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        VehicleLog log = new VehicleLog();
        log.setVehicleId(dto.getVehicleId());
        log.setLatitude(dto.getLatitude());
        log.setLongitude(dto.getLongitude());
        log.setCreatedAt(LocalDateTime.now());

        return log;
    }

    public VehicleLogResponseDTO toVehicleLogResponse(VehicleLog entity) {
        if (entity == null) {
            return null;
        }

        VehicleLogResponseDTO dto = new VehicleLogResponseDTO();
        dto.setId(entity.getId());
        dto.setVehicleId(entity.getVehicleId());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }
}
