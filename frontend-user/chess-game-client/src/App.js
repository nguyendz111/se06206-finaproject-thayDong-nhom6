import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import LessonsPage from "./pages/LessonsPage";
import CreateRoom from "./pages/CreateRoom";
import SolvePuzzles from "./pages/SolvePuzzles"; 
import PlayWithAI from "./pages/PlayWithAI.jsx";  // Import trang chơi với AI

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  const handleGameOver = (winningSide) => {
    setWinner(winningSide);
    setGameOver(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppRoutes onGameOver={handleGameOver} gameOver={gameOver} winner={winner} />} />
        <Route path="/learn" element={<LessonsPage />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/puzzles" element={<SolvePuzzles />} />
        <Route path="/play-ai" element={<PlayWithAI />} /> {/* Route chơi với AI */}
      </Routes>
    </Router>
  );
}

export default App;
