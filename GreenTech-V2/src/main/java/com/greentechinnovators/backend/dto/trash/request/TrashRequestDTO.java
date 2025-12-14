package com.greentechinnovators.backend.dto.trash.request;

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
public class TrashRequestDTO {

    @JsonProperty("weight")
    private Double weight;
    
    @JsonProperty("fillLevel")
    private Double fillLevel;
    
    @JsonProperty("timestamp")
    private String timestamp;

    @NotEmpty(message = "mac address can not be empty")
    @JsonProperty("mac")
    @JsonAlias({"mac", "macAddress"})
    private String macAddress;
}
