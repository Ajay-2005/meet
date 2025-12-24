package com.example.demo.dto;
import lombok.Data;

@Data
public class MessageResponseDTO {
    private String id;
    private String chat;
    private String sender;
    private String content;
    private String timestamp;
    private boolean delivered;
}

