package com.greentechinnovators.backend.config;

import com.greentechinnovators.backend.handler.EnergerIotWebSokrtHandller;
import com.greentechinnovators.backend.handler.TrashIotWebsocketHandeller;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer, WebSocketConfigurer {

    private final EnergerIotWebSokrtHandller energyIotHandler;
    private final TrashIotWebsocketHandeller trashIotHandler;
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();

        registry.addEndpoint("/ws-native").setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Messages prefixed with /app go to controller
        registry.setApplicationDestinationPrefixes("/app");
        // Messages prefixed with /topic go to subscribers
        registry.enableSimpleBroker("/topic");
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register WebSocket handlers for IoT devices
        registry.addHandler(energyIotHandler, "/iot/energy")
                .setAllowedOrigins("*");

        registry.addHandler(trashIotHandler, "/iot/trash")
                .setAllowedOrigins("*");
    }
}