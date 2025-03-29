import { io } from "socket.io-client";

// Kết nối với WebSocket server
const socket = io("http://localhost:5000");

// Xử lý khi kết nối thành công
socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server:", socket.id);
});

// Xử lý khi có nước đi từ đối thủ
socket.on("opponent-move", (move) => {
  console.log("♟ Opponent moved:", move);
  // TODO: Cập nhật bàn cờ với nước đi mới
});

// Xử lý khi người chơi vào phòng
socket.on("room-update", (players) => {
  console.log("👥 Players in room:", players);
});

// Xử lý khi phòng đầy
socket.on("room-full", () => {
  alert("🚫 This room is full! Please join another.");
});

// Xuất socket để dùng trong các component khác
export default socket;
