import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const SOCKET_URL = "http://localhost:8080/ws";
let stompClient = null;

/**
 * Kết nối WebSocket và đăng ký nhận tin nhắn
 */
export const connectWebSocket = (onMessageReceived) => {
  if (stompClient && stompClient.connected) {
    console.log("⚡ WebSocket đã kết nối");
    return;
  }

  const socket = new SockJS(SOCKET_URL);
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000, // Tự động kết nối lại sau 5 giây nếu mất kết nối
    debug: (msg) => console.log("🔍 STOMP Debug:", msg),

    onConnect: () => {
      console.log("✅ WebSocket đã kết nối!");

      // Đăng ký nhận thông điệp từ server
      stompClient.subscribe("/topic/chess-updates", (message) => {
        try {
          const moveData = JSON.parse(message.body);
          console.log("♟️ Nước đi nhận được:", moveData);
          if (onMessageReceived) onMessageReceived(moveData);
        } catch (error) {
          console.error("❌ Lỗi parse JSON:", error);
        }
      });
    },

    onDisconnect: () => console.log("❌ WebSocket bị ngắt kết nối"),
    onStompError: (frame) => console.error("🚨 STOMP Lỗi:", frame.headers["message"]),
  });

  try {
    stompClient.activate();
  } catch (error) {
    console.error("🚫 Không thể kích hoạt WebSocket:", error);
  }
};

/**
 * Lấy `stompClient` (nếu chưa kết nối thì kết nối trước)
 */
export const getStompClient = (onMessageReceived) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("⚠️ WebSocket chưa kết nối, đang thử kết nối lại...");
    connectWebSocket(onMessageReceived);
  }
  return stompClient;
};
