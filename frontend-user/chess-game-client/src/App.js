import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import LessonsPage from "./pages/LessonsPage"; // Import LessonsPage

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
        <Route path="/learn" element={<LessonsPage />} /> {/* Add LessonsPage Route */}
      </Routes>
    </Router>
  );
}

export default App;
