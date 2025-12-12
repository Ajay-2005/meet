package com.example.demo.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
@Entity
public class Messages {
    @Id
    private String id;
    private String senderID;
    private String receiverID;
    private String message;
    private String timestamp;
    private Boolean delivered;

}