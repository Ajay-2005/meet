package com.example.demo.listeners;

import com.example.demo.services.PresenceService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebsocketPresenceListener {
    private final PresenceService presenceService;
    public WebsocketPresenceListener(PresenceService presenceService) {
        this.presenceService = presenceService;
    }
    @EventListener
    public void handleWebSocketConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = accessor.getNativeHeader("userId").get(0);
        String sessionId = accessor.getSessionId();
        if(userId!=null){
            presenceService.userConnected(userId, sessionId);
        }
    }
    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        presenceService.userDisconnected(sessionId);
    }

}
