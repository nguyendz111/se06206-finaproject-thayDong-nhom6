import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";  // Import HomePage
import Board from "../components/Board";
import SigninForm from "../pages/SigninForm"; 
import SignupForm from "../pages/SignupForm";

function AppRoutes({ onGameOver, gameOver, winner }) {
  return (
    <Routes>
      {/* Trang mặc định là HomePage */}
      <Route path="/" element={<HomePage />} />
      
      <Route 
        path="/game" 
        element={gameOver ? <h2 className="text-center">{winner} thắng!</h2> : <Board onGameOver={onGameOver} />} 
      />
      <Route path="/profile" element={<h2 className="text-center">Thông tin người chơi</h2>} />
      <Route path="/login" element={<SigninForm />} />
      <Route path="/signup" element={<SignupForm />} />
    </Routes>
  );
}

export default AppRoutes;
