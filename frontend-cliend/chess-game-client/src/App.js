import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/home-page";
import ChessOnline from "./components/chess-online";
import ChessMonitor from "./components/chess-monitor";
import ChessPuzzleClient from "./components/chess-puzzle-client";
import ChessAI from "./components/ChessAI";

const App = () => {
  return (
    <Router>
      <Routes> {/* ✅ Bọc tất cả Route trong Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/chess-online" element={<ChessOnline />} />
        <Route path="/monitor" element={<ChessMonitor />} />
        <Route path="/puzzleclient" element={<ChessPuzzleClient />} />
        <Route path="/game/ai" element={<ChessAI />} />
      </Routes>
    </Router>
  );
};

export default App;
