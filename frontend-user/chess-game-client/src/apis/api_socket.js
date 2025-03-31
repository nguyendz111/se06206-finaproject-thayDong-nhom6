import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const SOCKET_URL = "http://localhost:8080/ws"; // URL backend WebSocket
let stompClient = null;

export const connectWebSocket = (onMoveReceived) => {
  if (stompClient && stompClient.connected) {
    console.log("⚡ WebSocket already connected");
    return;
  }

  const socket = new SockJS(SOCKET_URL);
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000, // Tự động reconnect sau 5 giây nếu mất kết nối
    debug: (msg) => console.log("🔍 STOMP Debug:", msg),
    onConnect: () => {
      console.log("✅ WebSocket Connected");

      stompClient.subscribe("/topic/chess-updates", (message) => {
        try {
          const moveData = JSON.parse(message.body);
          console.log("♟️ Move Received:", moveData);

          if (moveData && moveData.fromRow !== undefined && moveData.toRow !== undefined) {
            onMoveReceived(moveData);
          } else {
            console.warn("⚠️ Invalid move data received:", moveData);
          }
        } catch (error) {
          console.error("❌ Error parsing received move:", error);
        }
      });
    },
    onDisconnect: () => console.log("❌ WebSocket Disconnected"),
    onStompError: (frame) => console.error("🚨 STOMP Error:", frame),
  });

  stompClient.activate();
};

export const sendMove = (moveData) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("⚠️ Cannot send move, WebSocket is not connected.");
    return;
  }

  if (!moveData || moveData.fromRow === undefined || moveData.toRow === undefined) {
    console.warn("⚠️ Invalid move data:", moveData);
    return;
  }

  stompClient.publish({
    destination: "/app/move",
    body: JSON.stringify(moveData),
  });

  console.log("📤 Sent Move:", moveData);
};