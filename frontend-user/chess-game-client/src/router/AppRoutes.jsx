import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BoardAI from "../components/BoardAI";
import BoardOnline from "../components/BoardOnline";
import SigninForm from "../pages/SigninPage";
import SignupForm from "../pages/SignupPage";

function AppRoutes() {
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const handleGameOver = (winner) => {
    setGameOver(true);
    setWinner(winner);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      {/* Chế độ chơi với máy */}
      <Route
        path="/game/ai"
        element={
          gameOver ? <h2 className="text-center">{winner} thắng!</h2> : <BoardAI onGameOver={handleGameOver} />
        }
      />

      {/* Chế độ chơi online với người */}
      <Route path="/game/online/:roomId" element={<BoardOnline onGameOver={handleGameOver} />} />

      <Route path="/profile" element={<h2 className="text-center">Thông tin người chơi</h2>} />
      <Route path="/login" element={<SigninForm />} />
      <Route path="/signup" element={<SignupForm />} />
    </Routes>
  );
}

export default AppRoutes;
