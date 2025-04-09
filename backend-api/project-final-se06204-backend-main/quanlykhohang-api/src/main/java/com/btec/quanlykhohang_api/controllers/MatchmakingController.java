package com.btec.quanlykhohang_api.controllers;

import java.security.Principal;
import java.util.LinkedList;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/matchmaking")
public class MatchmakingController {

    private final Queue<String> waitingPlayers = new ConcurrentLinkedQueue<>();
    private final SimpMessagingTemplate messagingTemplate;

    public MatchmakingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/find-match")
    public void findMatch(Principal player) {
        String playerName = player.getName();

        String opponent = waitingPlayers.poll();
        if (opponent == null) {
            // Chưa có ai -> thêm vào hàng đợi
            waitingPlayers.add(playerName);
        } else {
            // Ghép cặp -> gửi message đến cả hai
            String roomId = UUID.randomUUID().toString();

            messagingTemplate.convertAndSendToUser(playerName, "/queue/match-found", new MatchResponse(roomId, "white"));
            messagingTemplate.convertAndSendToUser(opponent, "/queue/match-found", new MatchResponse(roomId, "black"));
        }
    }

    static class MatchResponse {
        public String roomId;
        public String color;

        public MatchResponse(String roomId, String color) {
            this.roomId = roomId;
            this.color = color;
        }
    }
}
