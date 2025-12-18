package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alert")
@RequiredArgsConstructor
public class AlertController {

    private final EmailService emailService;


}