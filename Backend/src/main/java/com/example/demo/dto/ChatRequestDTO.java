package com.example.demo.dto;
import lombok.Data;
import java.util.List;

@Data
public class ChatRequestDTO {
    private List<String> participantIds;
    private String name;
    private boolean GroupChat;
}
