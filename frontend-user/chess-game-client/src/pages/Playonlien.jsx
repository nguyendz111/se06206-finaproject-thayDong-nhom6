import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useNavigate } from "react-router-dom";

export default function Playonlien() {
  const [stompClient, setStompClient] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [color, setColor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws", // Đổi theo WebSocket URL của bạn
      reconnectDelay: 3000,
      onConnect: () => {
        console.log("✅ Connected to WebSocket");

        client.subscribe("/user/queue/match-found", (message) => {
          const data = JSON.parse(message.body);
          console.log("🎯 Match found:", data);
          setRoomId(data.roomId);
          setColor(data.color);
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket error", frame);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client && client.active) client.deactivate();
    };
  }, []);

  const handleFindMatch = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/find-match",
        body: "", // Có thể thêm userId nếu cần
      });
      console.log("🕹️ Finding match...");
    } else {
      alert("❌ WebSocket chưa kết nối!");
    }
  };

  useEffect(() => {
    if (roomId && color) {
      navigate(`/chessroom/${roomId}?color=${color}`);
    }
  }, [roomId, color, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6 text-red-700">Searching for Opponent...</h1>
      <button
        onClick={handleFindMatch}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
      >
        Play Online
      </button>
    </div>
  );
}
