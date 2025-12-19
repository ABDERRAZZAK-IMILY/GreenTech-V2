package com.greentechinnovators.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP WebSocket configuration for message broker.
 * Raw WebSocket handlers are configured in RawWebSocketConfig.java
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // STOMP endpoint with SockJS support for browser clients
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();

        // STOMP endpoint without SockJS for ESP32 and native clients
        registry.addEndpoint("/ws-native").setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Messages prefixed with /app go to controller
        registry.setApplicationDestinationPrefixes("/app");
        // Messages prefixed with /topic go to subscribers
        registry.enableSimpleBroker("/topic");
    }
}
