package com.greentechinnovators.backend.config;

import com.greentechinnovators.backend.handler.Esp32WebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final Esp32WebSocketHandler esp32Handler;

    public WebSocketConfig(Esp32WebSocketHandler esp32Handler) {
        this.esp32Handler = esp32Handler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(esp32Handler, "/ws").setAllowedOrigins("*");
    }
}