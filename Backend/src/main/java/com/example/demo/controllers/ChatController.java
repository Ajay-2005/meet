package com.example.demo.controllers;
import com.example.demo.dto.ChatRequestDTO;
import com.example.demo.dto.ChatResponseDTO;
import com.example.demo.dto.MessageRequestDTO;
import com.example.demo.dto.MessageResponseDTO;
import com.example.demo.models.Chat;
import com.example.demo.models.Messages;
import com.example.demo.models.Users;
import com.example.demo.services.ChatService;
import com.example.demo.services.PresenceService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/chats")
public class ChatController {
    private final ChatService chatService;
    private final PresenceService presenceService;
    public ChatController(ChatService chatService,PresenceService presenceService) {
        this.chatService = chatService;
        this.presenceService=presenceService;
    }
    @PostMapping("/create-chat")
    public ChatResponseDTO createChat(@RequestBody ChatRequestDTO request, HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if(userId == null) throw new RuntimeException("Unauthorized");

        Chat chat;
        if(request.isGroupChat()) {
            chat = chatService.createGroupChat(request.getName(), request.getParticipantIds());
        } else {
            if(request.getParticipantIds().size() != 1) {
                throw new RuntimeException("Private chat must have exactly one other participant");
            }
            chat = chatService.getOrCreatePrivateChat(userId, request.getParticipantIds().get(0));
        }

        ChatResponseDTO response = new ChatResponseDTO();
        response.setChatId(chat.getChatId());
        response.setName(chat.getName());
        response.setGroupChat(chat.isGroupChat());
        response.setParticipantIds(chat.getParticipants()
                .stream()
                .map(Users::getUserID)
                .toList());
        return response;
    }
    @PostMapping("/{chatId}/messages")
    public MessageResponseDTO sendMessage(
            @PathVariable String chatId,
            @RequestBody MessageRequestDTO request,
            HttpSession session
    ) {
        String senderId = (String) session.getAttribute("userId");
        if (senderId == null) throw new RuntimeException("Unauthorized");
        Messages saved = chatService.sendMessage(chatId, senderId, request.getContent());
        MessageResponseDTO response = new MessageResponseDTO();
        response.setId(saved.getId());
        response.setChat(saved.getChat().getChatId());
        response.setSender(saved.getSender().getUserID());
        response.setContent(saved.getContent());
        response.setTimestamp(saved.getTimestamp().toString());
        response.setDelivered(true);

        return response;
    }

    @GetMapping("/{chatId}/messages")
    public List<MessageResponseDTO> getMessages(@PathVariable String chatId, HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) throw new RuntimeException("Unauthorized");

        List<Messages> messages = chatService.getMessages(chatId);
        return messages.stream().map(msg -> {
            MessageResponseDTO dto = new MessageResponseDTO();
            dto.setId(msg.getId());
            dto.setChat(msg.getChat().getChatId());
            dto.setSender(msg.getSender().getUserID());
            dto.setContent(msg.getContent());
            dto.setTimestamp(msg.getTimestamp().toString());
            dto.setDelivered(true);
            return dto;
        }).toList();
    }
//    @GetMapping("/user/me")
//    public List<ChatResponseDTO> getUserChats(HttpSession session) {
//        String userId = (String) session.getAttribute("userId");
//        if (userId == null) throw new RuntimeException("Unauthorized");
//        List<String> chats = chatService.getUserChats(userId);
//        return chats.stream().map(chat -> {
//            ChatResponseDTO dto = new ChatResponseDTO();
//            dto.setChatId(chat.getChatId());
//            dto.setName(chat.getName());
//            dto.setGroupChat(chat.isGroupChat());
//            dto.setParticipantIds(chat.getParticipants()
//                    .stream()
//                    .map(u -> u.getUserID())
//                    .toList());
//            return dto;
//        }).toList();
//    }
    @GetMapping("/user/me")
    public List<ChatResponseDTO> getUserChats(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null) throw new RuntimeException("Unauthorized");

         List<Chat> chats = chatService.getUserChats(userId);

         return chats.stream().map(chat -> {
             ChatResponseDTO dto = new ChatResponseDTO();
             dto.setChatId(chat.getChatId());
             dto.setName(chat.getName());
             dto.setGroupChat(chat.isGroupChat());
             dto.setParticipantIds(
                     chat.getParticipants()
                             .stream()
                             .map(Users::getUserID)
                             .filter(id -> !id.equals(userId)) // exclude self
                             .toList()
             );

             return dto;
            }).toList();
    }


    @GetMapping("/{chatId}/online-users")
    public List<String> getOnlineUsers(@PathVariable String chatId) {
        // get all member IDs for this chat
        List<String> members = chatService.getChatMemberIds(chatId);
        return members.stream().filter(presenceService::isOnline).toList();
    }

//    @GetMapping("/{userId}")
//    public List<String> getUserChats(@PathVariable String userId) {
//        return chatService.getUserChats(userId);
//    }

}
