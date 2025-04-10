import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeLanguageProvider } from "./context/ThemeLanguageContext";
import AppRoutes from "./router/AppRoutes";
import FirstPage from "./pages/FirstPage";

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  const handleGameOver = (winningSide) => {
    setWinner(winningSide);
    setGameOver(true);
  };

  return (
    <ThemeLanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route
            path="/*"
            element={
              <AppRoutes
                onGameOver={handleGameOver}
                gameOver={gameOver}
                winner={winner}
              />
            }
          />
        </Routes>
      </Router>
    </ThemeLanguageProvider>
  );
}

export default App;
