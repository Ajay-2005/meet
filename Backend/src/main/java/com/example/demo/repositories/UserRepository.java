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
    select u from Users u
    where lower(u.username) like lower(concat('%', :q, '%')) escape '!'
      and u.userID <> :currentUserId
    order by case when lower(u.username) like lower(concat(:q, '%')) escape '!' then 0 else 1 end,
             lower(u.username)
    """)
    List<Users> searchByUsername(@Param("q") String q,
                                @Param("currentUserId") String currentUserId,
                                Pageable pageable);
}
