import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [timeControl, setTimeControl] = useState("10|5");

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert("Room name is required!");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName, timeControl }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create room");
      }
      
      const data = await response.json();
      navigate(`/game/${data.roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Error creating room. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-6">Create a Chess Room</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <label className="block mb-2 text-sm font-medium">Room Name:</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

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

        <button
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>

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