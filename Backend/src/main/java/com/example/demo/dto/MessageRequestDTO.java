package com.example.demo.dto;

import lombok.Data;

@Data
public class MessageRequestDTO {
    private String senderId;
    private String receiverId;
    private String message;
}
/*
 * we need two separate DTO because the client need to send (senderId, receiverId, message)
 * while client need to receive other details (id, timestamp,delivered status ) from the server
 */
