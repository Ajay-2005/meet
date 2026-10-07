package com.example.demo.controllers;

import com.example.demo.dto.AuthRequestDTO;
import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.models.Users;
import com.example.demo.services.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponseDTO register(@RequestBody AuthRequestDTO authRequestDTO) {
        return authService.register(authRequestDTO);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody AuthRequestDTO dto, HttpSession session) {
        AuthResponseDTO res = authService.login(dto);
        session.setAttribute("userId", res.getId());
        return res;
    }
    @GetMapping("/search-user")
    public ResponseEntity<AuthResponseDTO> searchUser(@RequestParam String username) {
        AuthResponseDTO res = authService.searchUser(username);
        if (res == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(res);
    }

}

