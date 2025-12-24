package com.example.demo.dto;
import lombok.Data;

@Data
public class MessageRequestDTO {
    private String chatId;
    private String senderId;
    private String content;
}
