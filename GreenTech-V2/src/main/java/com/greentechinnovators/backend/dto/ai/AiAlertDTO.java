package com.greentechinnovators.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiAlertDTO {
    private int id;
    private String type;
    private String icon;
    private String title;
    private String location;
    private String time;
}