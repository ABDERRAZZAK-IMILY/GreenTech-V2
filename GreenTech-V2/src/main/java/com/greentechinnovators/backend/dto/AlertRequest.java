package com.greentechinnovators.backend.dto;

public class AlertRequest {
    private String location;
    private int co2Level;
    private String phone;

    public String getLocation() {
        return location;
    }

    public int getCo2Level() {
        return co2Level;
    }

    public String getPhone() {
        return phone;
    }
}
