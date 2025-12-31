package com.example.demo.services;

import com.example.demo.models.Chat;
import com.example.demo.models.Messages;
import com.example.demo.models.Users;
import com.example.demo.repositories.ChatRepository;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {
    private ChatRepository chatRepository;
    private MessageRepository messageRepository;
    private UserRepository userRepository;
    public ChatService(ChatRepository chatRepository, MessageRepository messageRepository,UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository=userRepository;
    }

    // Get private chat between two users or create one if doesn't exists
    public Chat getOrCreatePrivateChat(String userId1,String userId2){
        Users user1=userRepository.findById(userId1).orElseThrow(() ->new RuntimeException("User1 not found"));
        Users user2=userRepository.findById(userId2).orElseThrow(() ->new RuntimeException("User2 not found"));
        Optional <Chat> existingChat=chatRepository.findByParticipantsUserID(userId1).stream()
                .filter(c->!c.isGroupChat() && c.getParticipants().size()==2 && c.getParticipants().contains(user2))
                .findFirst();
        if(existingChat.isPresent()){
            return existingChat.get();
        }
        Chat chat=new Chat();
        // chat.setGroup(false);
        chat.setParticipants(List.of(user1,user2));
        return chatRepository.save(chat);
    }
    // create group chat
    public Chat createGroupChat(String name, List<String> userIds){
        List<Users> participants=userRepository.findAllById(userIds);
        Chat chat=new Chat();
        chat.setGroupChat(true);
        chat.setName(name);
        chat.setParticipants(participants);
        return chatRepository.save(chat);
    }
    public Messages sendMessage(String chatId, String senderId, String message){
        Chat chat=chatRepository.findById(chatId).orElseThrow(()->new RuntimeException("Chat not found"));
        Users sender=userRepository.findById(senderId).orElseThrow(()->new RuntimeException("User not found"));
        Messages msg=new Messages();
        msg.setChat(chat);
        msg.setSender(sender);
        msg.setContent(message);
        msg.setTimestamp(LocalDateTime.now());
        return messageRepository.save(msg);
    }
    public List<Messages> getMessages(String chatId){
        return messageRepository.findByChat_ChatIdOrderByTimestampAsc(chatId);
    }
    public List<Chat> getUserChats(String userId) {
       return chatRepository.findByParticipantsUserID(userId);
    }

    public List<String> getChatMemberIds(String chatId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new RuntimeException("Chat not found"));
        return chat.getParticipants().stream().map(Users::getUserID).toList();
    }
}
