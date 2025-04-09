package com.btec.quanlykhohang_api.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChessRoomController {

    private final SimpMessagingTemplate messagingTemplate;
    private static final Map<String, Integer> rooms = new ConcurrentHashMap<>();

    public ChessRoomController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/create-room")
    public void createRoom() {
        String roomId = generateRoomId();
        rooms.put(roomId, 0); // Người tạo phòng tính là người đầu tiên

        System.out.println("✅ Room created: " + roomId);

        // Gửi roomId và màu cho người tạo phòng
        messagingTemplate.convertAndSend("/topic/chess-updates", Map.of(
            "type", "room-created",
            "roomId", roomId,
            "color", "w"
        ));
    }

    @MessageMapping("/join-room")
    public void joinRoom(Map<String, String> payload) {
        String roomId = payload.get("roomId");

        if (roomId == null || !rooms.containsKey(roomId)) {
            sendError("Room ID không tồn tại!");
            return;
        }

        int playerCount = rooms.get(roomId);
        if (playerCount >= 2) {
            sendError("Phòng đã đủ người!");
            return;
        }

        rooms.put(roomId, playerCount + 1);
        System.out.println("✅ Player joined room: " + roomId);

        // Gửi thông báo tham gia thành công và màu cho người chơi mới
        messagingTemplate.convertAndSend("/topic/chess-updates", Map.of(
            "type", "room-joined",
            "status", "success",
            "roomId", roomId,
            "color", "b"
        ));

        // Nếu đã đủ 2 người, gửi thông báo bắt đầu game
        if (rooms.get(roomId) == 2) {
            System.out.println("🎉 Game starting in room: " + roomId);
            messagingTemplate.convertAndSend("/topic/chess-updates", Map.of(
                "type", "start-game",
                "roomId", roomId
            ));
        }
    }

    private void sendError(String message) {
        messagingTemplate.convertAndSend("/topic/chess-updates", Map.of(
            "type", "error",
            "status", "error",
            "message", message
        ));
    }

    private String generateRoomId() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
