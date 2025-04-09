import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { ThemeLanguageContext } from "../context/ThemeLanguageContext";
import { connectWebSocket, getStompClient } from "../apis/api_socket";

const CreateRoom = () => {
  const { theme } = useContext(ThemeLanguageContext);
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState(""); // ✅ Thêm lại state cho màu

  const handleRoomEvents = useCallback((message) => {
    console.log("📩 Received message:", message);

    if (message.type === "room-created") {
      console.log("✅ Room successfully created:", message.roomId);
      setPlayerColor(message.color); // ✅ Lưu màu
      navigate(`/game/online/${message.roomId}`);
    } else if (message.type === "room-joined") {
      console.log("✅ Joined room successfully:", message.roomId);
      setPlayerColor(message.color); // ✅ Lưu màu
      navigate(`/game/online/${message.roomId}`);
    } else if (message.type === "game-started") {
      console.log("🚀 Game started in room:", message.roomId);
      setGameStarted(true);
    } else if (message.type === "opponent-move") {
      console.log("Opponent move:", message);
    } else if (message.type === "error") {
      setErrorMessage(message.message);
    }
  }, [navigate]);

  useEffect(() => {
    connectWebSocket(handleRoomEvents);
    return () => {
      console.log("Cleaning up WebSocket connection");
    };
  }, [handleRoomEvents]);

  const handleCreateRoom = () => {
    const stompClient = getStompClient(handleRoomEvents);

    if (!stompClient || !stompClient.connected) {
      alert("⚠️ WebSocket is not connected. Please try again.");
      return;
    }

    try {
      stompClient.publish({
        destination: "/app/create-room",
        body: JSON.stringify({}),
      });
      console.log("📤 Sent create-room request");
    } catch (error) {
      console.error("❌ Failed to send create-room request:", error);
      alert("🚨 Error sending room creation request.");
    }
  };

  const handleJoinRoom = () => {
    setErrorMessage("");

    if (!joinRoomId.trim()) {
      setErrorMessage("⚠️ Vui lòng nhập Room ID!");
      return;
    }

    const stompClient = getStompClient(handleRoomEvents);
    if (!stompClient || !stompClient.connected) {
      setErrorMessage("⚠️ WebSocket chưa kết nối. Thử lại sau!");
      return;
    }

    stompClient.publish({
      destination: "/app/join-room",
      body: JSON.stringify({ roomId: joinRoomId }),
    });

    console.log("📤 Sent join-room request:", { roomId: joinRoomId });
  };

  const startGame = () => {
    const stompClient = getStompClient(handleRoomEvents);

    if (!stompClient || !stompClient.connected) {
      alert("⚠️ WebSocket is not connected. Please try again.");
      return;
    }

    try {
      stompClient.publish({
        destination: "/app/start-game",
        body: JSON.stringify({ roomId: joinRoomId }),
      });
      console.log("📤 Sent start-game request");
    } catch (error) {
      console.error("❌ Failed to start the game:", error);
      alert("🚨 Error starting game.");
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className="fixed top-0 left-0 h-full w-64">
        <SideBar />
      </div>
      <div className="flex-1 p-6 ml-64 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-700 text-center">Create or Join a Chess Room</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <button
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
          <div className="mt-6 border-t border-gray-400 pt-4">
            <input
              type="text"
              className="w-full p-2 border rounded-md dark:bg-gray-700"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            <button
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
              onClick={handleJoinRoom}
            >
              Join Room
            </button>
          </div>

          {/* ✅ Hiển thị màu của người chơi */}
          {playerColor && (
            <div className="mt-4 text-center text-lg font-semibold text-green-600">
              Bạn đang chơi quân: {playerColor === "w" ? "Trắng (White)" : "Đen (Black)"}
            </div>
          )}

          {gameStarted && (
            <div className="mt-4">
              <button
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                onClick={startGame}
              >
                Start Game
              </button>
            </div>
          )}
          <button
            className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
