import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Board from "../components/Board";
import SigninForm from "../pages/SigninPage";
import SignupForm from "../pages/SignupPage";
import LessonsPage from "../pages/LessonsPage"; // Import trang bài học
import PuzzlesPage from "../pages/PuzzlesPage"; // Import trang giải đố
import { ThemeLanguageContext } from "../context/ThemeLanguageContext"; // Import Context

function AppRoutes({ onGameOver, gameOver, winner }) {
  const { theme } = useContext(ThemeLanguageContext); // Lấy theme từ context

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="game"
          element={gameOver ? <h2 className="text-center">{winner} thắng!</h2> : <Board onGameOver={onGameOver} />}
        />
        <Route path="profile" element={<h2 className="text-center">Thông tin người chơi</h2>} />
        <Route path="login" element={<SigninForm />} />
        <Route path="signup" element={<SignupForm />} />
        <Route path="learn" element={<LessonsPage />} /> {/* Thêm trang bài học */}
        <Route path="puzzles" element={<PuzzlesPage />} /> {/* Thêm trang giải đố */}
      </Routes>
    </div>
  );
}

export default AppRoutes;
