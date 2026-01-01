package com.example.demo.dto;

import lombok.Data;

@Data
public class TypingIndicatorDTO {
    private String chatId;
    private String userId;
    private String isTyping;
}
