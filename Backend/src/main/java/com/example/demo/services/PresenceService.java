package com.example.demo.services;

import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();
    private final Map<String,String> sessionsToUser = new ConcurrentHashMap<>();
    // returns true if user JUST came online
    public boolean userConnected(String userId, String sessionId) {
        userSessions.putIfAbsent(userId, ConcurrentHashMap.newKeySet());
        userSessions.get(userId).add(sessionId);
        sessionsToUser.put(sessionId, userId);

        return userSessions.get(userId).size() == 1;
    }
    // returns true if user JUST went offline
    public boolean userDisconnected(String sessionId) {
        String userId = sessionsToUser.remove(sessionId);
        if (userId == null){
            return false;
        }
        Set<String> sessions = userSessions.get(userId);
        if (sessions == null) {
            return false;
        }
        sessions.remove(sessionId);
        if (sessions.isEmpty()) {
            userSessions.remove(userId);
            return true;
        }
        return false;
    }

    public boolean isOnline(String userId) {
        return userSessions.containsKey(userId);
    }

}
