import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SigninPage />} />
        <Route path="/game/player-vs-player" element={<h1>Player vs Player</h1>} />
        <Route path="/game/player-vs-computer" element={<h1>Player vs Computer</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

