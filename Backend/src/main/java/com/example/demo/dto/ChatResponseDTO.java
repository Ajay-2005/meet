package com.example.demo.dto;
import lombok.Data;
import java.util.List;

@Data
public class ChatResponseDTO {
    private String chatId;
    private String name;
    private boolean GroupChat;
    private List<String> participantIds;
}


