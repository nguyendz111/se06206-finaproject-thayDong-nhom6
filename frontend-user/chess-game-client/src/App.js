import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeLanguageProvider } from "./context/ThemeLanguageContext"; // Import Provider
import AppRoutes from "./router/AppRoutes";

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  const handleGameOver = (winningSide) => {
    setWinner(winningSide);
    setGameOver(true);
  };

  return (
    <ThemeLanguageProvider> {/* Bọc toàn bộ ứng dụng với Theme & Language */}
      <Router>
        <Routes>
          <Route
            path="/*"
            element={<AppRoutes onGameOver={handleGameOver} gameOver={gameOver} winner={winner} />}
          />
        </Routes>
      </Router>
    </ThemeLanguageProvider>
  );
}

export default App;
