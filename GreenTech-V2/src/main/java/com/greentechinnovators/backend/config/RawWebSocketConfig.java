package com.greentechinnovators.backend.config;

import com.greentechinnovators.backend.handler.EnergerIotWebSokrtHandller;
import com.greentechinnovators.backend.handler.TrashIotWebsocketHandeller;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Separate configuration for raw WebSocket handlers (non-STOMP).
 * This is separated from the STOMP configuration to avoid SockJS intercepting
 * these paths.
 * Using @Order(Ordered.HIGHEST_PRECEDENCE) ensures this configuration is
 * processed first.
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RawWebSocketConfig implements WebSocketConfigurer {

    private final EnergerIotWebSokrtHandller energyIotHandler;
    private final TrashIotWebsocketHandeller trashIotHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register raw WebSocket handlers for IoT devices and Dashboard
        // These are NOT STOMP endpoints, they're plain WebSocket connections
        registry.addHandler(energyIotHandler, "/iot/energy")
                .setAllowedOrigins("*");

        registry.addHandler(trashIotHandler, "/iot/trash")
                .setAllowedOrigins("*");
    }
}
