import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Board from "../components/Board";
import PlayComputerPage from "../pages/PlayComputerPage"; // ✅ Đúng đường dẫn
import SigninForm from "../pages/SigninPage";
import SignupForm from "../pages/SignupPage";
import LessonsPage from "../pages/LessonsPage";
import PuzzlesPage from "../pages/PuzzlesPage";
import CreateRoom from "../pages/CreateRoom";
import WatchGame from "../pages/WatchGamePage";
import { ThemeLanguageContext } from "../context/ThemeLanguageContext";

function AppRoutes({ onGameOver, gameOver, winner }) {
  const { theme } = useContext(ThemeLanguageContext);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="game"
          element={gameOver ? <h2 className="text-center">{winner} thắng!</h2> : <Board onGameOver={onGameOver} />}
        />
        <Route path="play-computer" element={<PlayComputerPage />} /> {/* ✅ Trang Chơi với Máy */}
        <Route path="profile" element={<h2 className="text-center">Thông tin người chơi</h2>} />
        <Route path="login" element={<SigninForm />} />
        <Route path="signup" element={<SignupForm />} />
        <Route path="learn" element={<LessonsPage />} />
        <Route path="puzzles" element={<PuzzlesPage />} />
        <Route path="create-room" element={<CreateRoom />} />
        <Route path="watch-games" element={<WatchGame />} />
      </Routes>
    </div>
  );
}

export default AppRoutes;
