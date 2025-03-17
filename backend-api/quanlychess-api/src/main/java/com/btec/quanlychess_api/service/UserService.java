package com.btec.quanlychess_api.service;

import com.btec.quanlychess_api.model.User;
import com.btec.quanlychess_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Đăng ký user mới
    public String registerUser(String username, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            return "Email already exists";
        }
        if (userRepository.existsByUsername(username)) {
            return "Username already taken";
        }

        String encodedPassword = passwordEncoder.encode(password);
        User newUser = new User(username, email, encodedPassword);
        userRepository.save(newUser);
        return "User registered successfully";
    }

    // Xác thực đăng nhập
    public boolean authenticateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return false;
        }
        User user = userOptional.get();
        return passwordEncoder.matches(password, user.getPassword());
    }
}
