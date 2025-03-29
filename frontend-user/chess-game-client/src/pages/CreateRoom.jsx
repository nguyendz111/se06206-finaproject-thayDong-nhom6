import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../apis/api_socket"; // Import WebSocket

export default function CreateRoom() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(""); // Nhập ID phòng
  const [roomName, setRoomName] = useState("");
  const [timeControl, setTimeControl] = useState("10|5");

  const handleCreateRoom = () => {
    if (!roomId.trim()) {
      alert("⚠️ Room ID is required!");
      return;
    }
    if (!roomName.trim()) {
      alert("⚠️ Room name is required!");
      return;
    }

    // Gửi yêu cầu tạo phòng qua WebSocket
    socket.emit("create-room", { roomId, roomName, timeControl });

    // Lắng nghe sự kiện "room-created" để xác nhận trước khi chuyển trang
    socket.once("room-created", (data) => {
      console.log("✅ Room created:", data);
      navigate(`/game/online/${roomId}`);
    });

    // Xử lý khi phòng đã đầy
    socket.once("room-full", () => {
      alert("🚫 This room is full! Please choose another ID.");
    });

    // Xử lý lỗi từ server
    socket.once("error", (data) => {
      alert(`⚠️ ${data.message}`);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-6">
        Create a Chess Room
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        {/* Nhập ID phòng */}
        <label className="block mb-2 text-sm font-medium">Room ID:</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        {/* Nhập Tên phòng */}
        <label className="block mt-4 mb-2 text-sm font-medium">Room Name:</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        {/* Chọn Thời gian */}
        <label className="block mt-4 mb-2 text-sm font-medium">Time Control:</label>
        <select
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
          value={timeControl}
          onChange={(e) => setTimeControl(e.target.value)}
        >
          <option value="10|5">10 min | 5 sec</option>
          <option value="5|3">5 min | 3 sec</option>
          <option value="3|2">3 min | 2 sec</option>
          <option value="unlimited">No Time Limit</option>
        </select>

        {/* Nút Tạo Phòng */}
        <button
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>

        {/* Nút Quay về Home */}
        <button
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
