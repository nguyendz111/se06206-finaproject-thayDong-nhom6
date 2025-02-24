import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import GameBoard from "./components/GameBoard";
import SigninForm from "./pages/SigninForm"; 
import SignupForm from "./pages/SignupForm";
import SidebarMenu from "./components/SidebarMenu";  // Import SidebarMenu

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
        {/* Sidebar bên trái */}
        <SidebarMenu />

        {/* Nội dung chính */}
        <div className="flex justify-center items-center w-full h-full">
          <div className="main-content text-white">
            <h1 className="text-4xl font-bold text-center mb-6">ChessPlayer</h1>
            <Routes>
              {/* Mặc định vào trang GameBoard */}
              <Route path="/" element={<GameBoard onGameOver={handleGameOver} />} />

              {/* Trang chơi game */}
              <Route
                path="/game"
                element={
                  gameOver ? (
                    <div className="game-over-screen text-center">
                      <h2 className="text-2xl">{winner} thắng!</h2>
                    </div>
                  ) : (
                    <GameBoard onGameOver={handleGameOver} />
                  )
                }
              />

              {/* Trang hồ sơ người chơi */}
              <Route path="/profile" element={<h2 className="text-center">Thông tin người chơi</h2>} />

              {/* Trang đăng nhập */}
              <Route path="/login" element={<SigninForm />} />

              {/* Trang đăng ký */}
              <Route path="/signup" element={<SignupForm />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
