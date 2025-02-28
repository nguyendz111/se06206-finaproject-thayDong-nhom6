import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  const handleGameOver = (winningSide) => {
    setWinner(winningSide);
    setGameOver(true);
  };

  return (
    <Router>
      <AppRoutes onGameOver={handleGameOver} gameOver={gameOver} winner={winner} />
    </Router>
  );
}

export default App;
