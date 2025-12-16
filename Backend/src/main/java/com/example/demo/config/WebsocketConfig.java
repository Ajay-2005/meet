package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // allow all origins to avoid cors issues
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*") .withSockJS().setInterceptors(new HttpSessionHandshakeInterceptor());// endpoint for websocket connection
    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // /topic to send message to all users, /queue to send message to specific user
        registry.enableSimpleBroker("/topic","/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

}
