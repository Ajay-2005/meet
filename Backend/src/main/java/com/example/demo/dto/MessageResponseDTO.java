package com.example.demo.dto;

import lombok.Data;

@Data
public class MessageResponseDTO {
    private String id;
    private String senderId;
    private String receiverId;
    private String message;
    private String timestamp;
    private boolean delivered;
}
