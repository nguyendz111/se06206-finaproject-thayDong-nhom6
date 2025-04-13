import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/home-page';
import ChessOnline from "./components/chess-online";
import ChessMonitor from "./components/chess-monitor";
import ChessPuzzleClient from "./components/chess-puzzle-client";
import ChessAI from "./components/ChessAI";
import Lessons from "./components/LessonsPage"
import FirstPage from './components/FirstPage';
const App = () => {
  return (
    <Router>
      <Routes> {/* ✅ Bọc tất cả Route trong Routes */}
        {/* Trang gốc ("/") hiển thị FirstPage */}
        <Route path="/" element={<FirstPage />} />
        {/* Trang homepage */}
        <Route path="/home" element={<Home />} />
        <Route path="/chess-online" element={<ChessOnline />} />
        <Route path="/monitor" element={<ChessMonitor />} />
        <Route path="/puzzleclient" element={<ChessPuzzleClient />} />
        <Route path="/game/ai" element={<ChessAI />} />
        <Route path="/learn" element={<Lessons/>} />
      </Routes>
    </Router>
  );
};

export default App;
