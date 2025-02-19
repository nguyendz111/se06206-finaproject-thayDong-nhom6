// src/App.js
import React, { useState } from "react";
import "./App.css";
import GameBoard from "./components/GameBoard";

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  const handleGameOver = (winningSide) => {
    setWinner(winningSide);
    setGameOver(true);
  };
  
  return (
    <div className="App">
      <h1 className="title">ChessPLayer</h1>
      {gameOver ? (
        <div className="game-over">
          <h2>{winner} thắng!</h2>
          <button onClick={() => window.location.reload()}>Chơi lại</button>
        </div>
      ) : (
        <GameBoard onGameOver={handleGameOver} />
      )}
    </div>
  );
}

export default App;
