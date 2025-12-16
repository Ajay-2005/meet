package com.example.demo.repositories;

import com.example.demo.models.Messages;
import jakarta.persistence.Entity;
import lombok.Data;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends JpaRepository<Messages, String> {
        List<Messages> findByChat_ChatIdOrderByTimestampAsc(String chatId);
        List<Messages> findByChat_ChatIdAndDeliveredFalseOrderByTimestampAsc(String chatId);
        List<Messages> findBySender_UserIDOrderByTimestampAsc(String senderId);
        List<Messages> findByChat_ChatIdAndTimestampAfterOrderByTimestampAsc(String chatId, LocalDateTime timestamp);
}


