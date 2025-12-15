package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.AlertRequest;
import org.springframework.stereotype.Service;

@Service
public class AlertService {

    private final SmsService smsService;
    private static final int CO2_LIMIT = 1500;

    public AlertService(SmsService smsService) {
        this.smsService = smsService;
    }

    public void checkAndSend(AlertRequest request) {

        if (request.getCo2Level() >= CO2_LIMIT) {

            String message =
                    "⚠️ تنبيه بيئي!\n" +
                            "المكان: " + request.getLocation() + "\n" +
                            "CO₂: " + request.getCo2Level() + " ppm\n" +
                            "المرجو اتخاذ الاحتياطات.";

            smsService.sendSms(request.getPhone(), message);
        }
    }
}
