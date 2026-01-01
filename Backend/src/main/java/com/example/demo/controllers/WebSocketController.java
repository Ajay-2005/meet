package com.example.demo.controllers;
import com.example.demo.dto.MessageRequestDTO;
import com.example.demo.dto.MessageResponseDTO;
import com.example.demo.dto.TypingIndicatorDTO;
import com.example.demo.models.Chat;
import com.example.demo.models.Messages;
import com.example.demo.services.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.example.demo.repositories.ChatRepository;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository chatRepository;

    public WebSocketController(ChatService chatService,
                                   SimpMessagingTemplate messagingTemplate,ChatRepository chatRepository) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
        this.chatRepository=chatRepository;
    }
    @MessageMapping("/chat/send")
    public void sendMessage(MessageRequestDTO request){
        System.out.println("chatId:"+request.getChatId());
        System.out.println("senderId:"+request.getSenderId());
        System.out.println("content:"+request.getContent());
        Messages saved = chatService.sendMessage(
                request.getChatId(),
                request.getSenderId(),
                request.getContent()
        );
        MessageResponseDTO response = new MessageResponseDTO();
        response.setId(saved.getId());
        response.setChat(saved.getChat().getChatId());
        response.setSender(saved.getSender().getUserID());
        response.setContent(saved.getContent());
        response.setTimestamp(saved.getTimestamp().toString());
        response.setDelivered(true);
        messagingTemplate.convertAndSend(
                "/topic/chat/" + saved.getChat().getChatId(),
                response
        );
    }
    @MessageMapping("/typing")
    public void handleTyping(TypingIndicatorDTO msg) {
         System.out.println(" TYPING EVENT RECEIVED: " + msg);
         chatService.sendingTypingIndicators(msg);
    }
}

