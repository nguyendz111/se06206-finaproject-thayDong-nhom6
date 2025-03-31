import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { connectWebSocket } from "../apis/api_socket"; 

export default function CreateRoom() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(""); 
  const [timeControl, setTimeControl] = useState("10|5");
  const [joinRoomId, setJoinRoomId] = useState(""); // Room ID để tham gia

  useEffect(() => {
    setRoomId(generateRoomId());
  }, []);

  // Tạo Room ID tự động (5-6 ký tự chữ + số)
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleRoomEvents = useCallback((message) => {
    if (message.type === "room-created") {
      console.log("✅ Room created:", message.data);
      navigate(`/game/online/${roomId}`);
    } else if (message.type === "room-full") {
      alert("🚫 This room is full! Please choose another ID.");
    } else if (message.type === "error") {
      alert(`⚠️ ${message.data.message}`);
    }
  }, [navigate, roomId]);

  useEffect(() => {
    connectWebSocket(handleRoomEvents);
  }, [handleRoomEvents]);

  const handleCreateRoom = () => {
    window.stompClient.publish({
      destination: "/app/create-room",
      body: JSON.stringify({ roomId, timeControl }),
    });
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      alert("⚠️ Please enter a Room ID to join!");
      return;
    }
    navigate(`/game/online/${joinRoomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-6">
        Create or Join a Chess Room
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        
        {/* Room ID */}
        <label className="block mb-2 text-sm font-medium">Room ID:</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
          value={roomId}
          disabled
        />

        {/* Time Control */}
        <label className="block mt-4 mb-2 text-sm font-medium">Time Control:</label>
        <select
          className="w-full p-2 border rounded-md dark:bg-gray-700"
          value={timeControl}
          onChange={(e) => setTimeControl(e.target.value)}
        >
          <option value="10|5">10 min | 5 sec</option>
          <option value="5|3">5 min | 3 sec</option>
          <option value="3|2">3 min | 2 sec</option>
          <option value="unlimited">No Time Limit</option>
        </select>

        {/* Create Room Button */}
        <button
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>

        {/* Join Room Section */}
        <div className="mt-6 border-t border-gray-400 pt-4">
          <label className="block mb-2 text-sm font-medium">Enter Room ID to Join:</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md dark:bg-gray-700"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
          />
          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>

        {/* Back to Home Button */}
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
