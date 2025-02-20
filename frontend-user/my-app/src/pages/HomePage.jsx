import { useNavigate } from "react-router-dom";
import { useState } from "react";
import chessBg from "../assets/images/chess-bg.jpg"; // Đảm bảo hình ảnh tồn tại trong thư mục assets!

const HomePage = () => {
  const navigate = useNavigate();
  const [isPlayDropdownOpen, setIsPlayDropdownOpen] = useState(false);

  return (
    <div>
      {/* 🔹 PHẦN HERO - ẢNH NỀN */}
      <div
        className="h-screen flex flex-col items-center justify-center text-white p-6 relative"
        style={{
          backgroundImage: `url(${chessBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Sidebar Navigation */}
        <nav className="fixed left-0 top-0 h-full w-60 bg-black bg-opacity-80 flex flex-col justify-between p-6">
          {/* Sidebar Top */}
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">♟️ ChessPlayer</h1>

            {/* Play Menu with Dropdown */}
            <div
              className="relative w-full"
              onMouseEnter={() => setIsPlayDropdownOpen(true)}
              onMouseLeave={() => setIsPlayDropdownOpen(false)}
            >
              <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-left">
                🎮 Play
              </button>
              {isPlayDropdownOpen && (
                <div className="absolute left-full top-0 bg-gray-800 shadow-lg rounded-lg w-40">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-600"
                    onClick={() => navigate("/play-online")}
                  >
                    🌍 Solo
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-600"
                    onClick={() => navigate("/play-offline")}
                  >
                    🏠 Two players
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-600"
                    onClick={() => navigate("/play-bot")}
                  >
                    🤖 Play BOT
                  </button>
                </div>
              )}
            </div>

            {/* Ranking Button */}
            <button
              className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-left mt-4"
              onClick={() => navigate("/ranking")}
            >
              📊 Ranking
            </button>
          </div>

          {/* Sidebar Bottom (Auth Buttons) */}
          <div className="w-full">
            <button
              className="bg-blue-500 hover:bg-blue-600 w-full px-4 py-2 rounded-lg mb-4"
              onClick={() => navigate("/sign-up")}
            >
              Register
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 w-full px-4 py-2 rounded-lg"
              onClick={() => navigate("/sign-in")}
            >
              Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mt-12 ml-64">
          <h2 className="text-5xl font-bold mb-4">Play Chess Like A Master</h2>
          <p className="text-lg opacity-80">
            Challenge players, test your skills, and climb the leaderboard!
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg mt-10 ml-64">
          <h2 className="text-2xl font-semibold mb-4">Choose Your Game Mode</h2>
          <div className="flex flex-col gap-4">
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition transform hover:scale-105"
              onClick={() => navigate("/game/player-vs-player")}
            >
              🏆 Play Online
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition transform hover:scale-105"
              onClick={() => navigate("/game/player-vs-computer")}
            >
              🤖 Play BOT
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 PHẦN HƯỚNG DẪN CHƠI CỜ VUA */}
      <section className="bg-gray-900 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-green-400 mb-6">
          ♟️ How to Play Chess
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
          Chess is a strategic board game played between two players.
          The objective is to checkmate your opponent’s king.
        </p>
        <div className="max-w-3xl mx-auto text-left">
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>♜ Rooks move in straight lines.</li>
            <li>♞ Knights move in an "L" shape.</li>
            <li>♝ Bishops move diagonally.</li>
            <li>♛ The Queen can move in any direction.</li>
            <li>♚ The King moves one square in any direction.</li>
            <li>♟️ Pawns move forward but capture diagonally.</li>
          </ul>
        </div>
        <button
          className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition transform hover:scale-105"
          onClick={() => navigate("/how-to-play")}
        >
          Learn More
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white text-center py-6">
        <p>© 2025 Chess Master | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;
