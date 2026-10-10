package com.example.demo.repositories;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.Users;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, String> {
    Users findByUsername(String username);
    
    @Query("""
        SELECT u
        FROM Users u
        WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')) ESCAPE '\\'
          AND u.userID <> :currentUserId
        ORDER BY
          CASE WHEN LOWER(u.username) LIKE LOWER(CONCAT(:q, '%')) ESCAPE '\\' THEN 0 ELSE 1 END,
          LOWER(u.username)
        """)
    List<Users> searchByUsername(@Param("q") String q,
                                @Param("currentUserId") String currentUserId,
                                Pageable pageable);
}
