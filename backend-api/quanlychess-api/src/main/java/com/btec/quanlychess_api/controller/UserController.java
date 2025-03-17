package com.btec.quanlychess_api.controller;

import com.btec.quanlychess_api.model.User;
import com.btec.quanlychess_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Cho phép React frontend truy cập API
public class UserController {
    @Autowired
    private UserService userService;

    // API Đăng ký tài khoản
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody User user) {
        String result = userService.registerUser(user.getUsername(), user.getEmail(), user.getPassword());
        Map<String, String> response = new HashMap<>();
        response.put("message", result);

        if (result.equals("User registered successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    // API Đăng nhập
    @PostMapping("/signin")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        boolean isAuthenticated = userService.authenticateUser(email, password);
        Map<String, String> response = new HashMap<>();

        if (isAuthenticated) {
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid email or password");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
