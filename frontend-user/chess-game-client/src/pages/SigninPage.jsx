import { useNavigate } from "react-router-dom";
import chessBg from "../assets/images/chess-bg.jpg";

const HomePage = () => {
  const navigate = useNavigate();

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
        {/* Hero Section */}
        <div className="text-center mt-12">
          <h2 className="text-5xl font-bold mb-4">Play Chess Like A Master</h2>
          <p className="text-lg opacity-80">
            Challenge players, test your skills, and climb the leaderboard!
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg mt-10">
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

      {/* 🔹 CHESS PLAYING GUIDE SECTION */}
      <section className="bg-gray-900 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-green-400 mb-6">
          ♚ How to Play Chess ♛
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
        <p>© 2025 ChessPlayer | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;