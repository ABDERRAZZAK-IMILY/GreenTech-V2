package com.greentechinnovators.backend.config;

import com.greentechinnovators.backend.handler.Esp32WebSocketHandler;
import com.greentechinnovators.backend.handler.NotificationWebSocketHandler;
import com.greentechinnovators.backend.handler.WSEnergyHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final Esp32WebSocketHandler esp32Handler;
    private final NotificationWebSocketHandler notificationHandler;
    private final WSEnergyHandler  wsEnergyHandler;



    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(esp32Handler, "/ws").setAllowedOrigins("*");
        registry.addHandler(notificationHandler, "/notifications").setAllowedOrigins("*");
        registry.addHandler(wsEnergyHandler, "/wsEnergy").setAllowedOrigins("*");
    }
}