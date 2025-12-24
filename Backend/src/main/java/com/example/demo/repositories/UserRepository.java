package com.example.demo.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Users;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, String> {
    Users findByUsername(String username);
}
