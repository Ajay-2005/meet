package com.example.demo.controllers;

import com.example.demo.dto.AuthRequestDTO;
import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.services.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
