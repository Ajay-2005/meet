package com.example.demo.controllers;

import com.example.demo.dto.MessageRequestDTO;
import com.example.demo.dto.MessageResponseDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
public class ChatController {

    // Client sends message to /app/chat.send
    @MessageMapping("/chat.send")
    // Broadcast to all subscribers of /topic/messages
    @SendTo("/topic/messages")
    public MessageResponseDTO sendMessage(MessageRequestDTO messageRequest) {
        // Dummy response just to test WebSocket
        MessageResponseDTO response = new MessageResponseDTO();
        response.setId(UUID.randomUUID().toString());
        response.setSenderId(messageRequest.getSenderId());
        response.setReceiverId(messageRequest.getReceiverId());
        response.setMessage(messageRequest.getMessage());
        response.setTimestamp(LocalDateTime.now().toString());
        response.setDelivered(true);

        return response;
    }
}
