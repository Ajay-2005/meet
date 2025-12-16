package com.example.demo.models;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
   private String userID;
    @Column(unique = true, nullable = false)
   private String username;
   private String password;

}
