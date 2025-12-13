package com.greentechinnovators.backend.dto;

public class ReportFileDto {
    public String fileName;
    public long lastModified;
    public String size;

    public ReportFileDto(String fileName, long lastModified, String size) {
        this.fileName = fileName;
        this.lastModified = lastModified;
        this.size = size;
    }
}