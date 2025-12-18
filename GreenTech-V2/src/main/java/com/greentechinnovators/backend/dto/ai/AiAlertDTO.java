package com.greentechinnovators.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiAlertDTO {
    private int id;
    private String type;     // critical, offline, warning, info
    private String icon;     // fa-fire, fa-truck...
    private String title;
    private String location; // Le message de détail
    private String time;     // "À l'instant", "Il y a 10 min"
}