import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import SidebarMenu from "./components/SidebarMenu";
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
      <div className="flex h-screen bg-gray-800">
        <SidebarMenu />
        <div className="flex justify-center items-center w-full h-full">
          <div className="main-content text-white">
            <h1 className="text-4xl font-bold text-center mb-6">ChessPlayer</h1>
            <AppRoutes onGameOver={handleGameOver} gameOver={gameOver} winner={winner} />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
