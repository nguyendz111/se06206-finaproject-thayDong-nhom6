import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/home-page";
import ChessOnline from "./components/chess-online";
import ChessMonitor from "./components/chess-monitor";
import ChessPuzzleClient from "./components/chess-puzzle-client";


const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chess-online" element={<ChessOnline />} />
      <Route path="/monitor" element={<ChessMonitor />} />
      <Route path="/puzzleclient" element={<ChessPuzzleClient />} />
      </Routes>
    </Router>
  );
};

export default App;
