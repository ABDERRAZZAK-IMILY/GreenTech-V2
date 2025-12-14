package com.greentechinnovators.backend.dto.Energy.Request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergyRequestDTO {
    
    @JsonProperty("powerKW")
    private Double powerKW;
    
    @JsonProperty("powerW")
    private Double powerW;
    
    @JsonProperty("currentA")
    private Double currentA;
    
    @JsonProperty("voltage")
    private Double voltage;
    
    @JsonProperty("timestamp")
    private String timestamp;
    
    @NotEmpty(message = "mac address can not be empty")
    @JsonProperty("mac")
    @JsonAlias({"mac", "macAddress"})
    private String macAddress;
    
    // For backward compatibility - energyConsumed can be calculated from powerKW
    private Double energyConsumed;
}
