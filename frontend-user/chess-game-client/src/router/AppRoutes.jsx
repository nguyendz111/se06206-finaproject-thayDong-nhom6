import React, { useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BoardAI from "../components/BoardAI";
import BoardOnline from "../components/BoardOnline";
import SigninForm from "../pages/SigninPage";
import SignupForm from "../pages/SignupPage";
import LessonsPage from "../pages/LessonsPage";
import PuzzlesPage from "../pages/SolvePuzzles";
import CreateRoom from "../pages/CreateRoom";
import WatchGame from "../pages/WatchGamePage";

import { ThemeLanguageProvider, ThemeLanguageContext } from "../context/ThemeLanguageContext";

function AppRoutes() {
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const handleGameOver = (winner) => {
    setGameOver(true);
    setWinner(winner);
  };

  return (
    <ThemeLanguageProvider>
      <ThemedRoutes onGameOver={handleGameOver} gameOver={gameOver} winner={winner} />
    </ThemeLanguageProvider>
  );
}

function ThemedRoutes({ onGameOver, gameOver, winner }) {
  const { theme } = useContext(ThemeLanguageContext);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
       
        <Route 
          path="/game/ai" 
          element={gameOver ? <h2 className="text-center">{winner} thắng!</h2> : <BoardAI onGameOver={onGameOver} />} 
        />
        <Route 
          path="/game/online/:roomId" 
          element={<BoardOnline onGameOver={onGameOver} />} 
        />
        <Route path="/chessroom/:roomId" element={<ChessRoom />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/watch-games" element={<WatchGame />} />
        <Route path="/profile" element={<h2 className="text-center">Thông tin người chơi</h2>} />
        <Route path="/login" element={<SigninForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/learn" element={<LessonsPage />} />
        <Route path="/puzzles" element={<PuzzlesPage />} />
      </Routes>
    </div>
  );
}

export default AppRoutes;
