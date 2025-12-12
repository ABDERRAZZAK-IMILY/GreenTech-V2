package com.greentechinnovators.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReportData {
    private double transportKm;
    private double transportCo2;
    private double trashWeight;
    private double trashCo2;
    private double energyKwh;
    private double energyCo2;
}