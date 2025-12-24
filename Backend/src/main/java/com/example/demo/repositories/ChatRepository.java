package com.example.demo.repositories;
import com.example.demo.models.Chat;
import lombok.Data;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, String>{
    List<Chat> findByParticipantsUserID(String userId);

}
