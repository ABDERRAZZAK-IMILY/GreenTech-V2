package com.greentechinnovators.backend.config;

import com.greentechinnovators.backend.handler.Esp32WebSocketHandler;
import com.greentechinnovators.backend.handler.NotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final Esp32WebSocketHandler esp32Handler;
    private final NotificationWebSocketHandler notificationHandler;

    public WebSocketConfig(Esp32WebSocketHandler esp32Handler, 
                          NotificationWebSocketHandler notificationHandler) {
        this.esp32Handler = esp32Handler;
        this.notificationHandler = notificationHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(esp32Handler, "/ws").setAllowedOrigins("*");
        registry.addHandler(notificationHandler, "/notifications").setAllowedOrigins("*");
    }
}