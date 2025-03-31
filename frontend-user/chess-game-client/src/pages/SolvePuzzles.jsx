import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chess } from "chess.js";

export default function SolvePuzzles() {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState(null);
  const [userMove, setUserMove] = useState("");
  const [message, setMessage] = useState("");
  const [chess, setChess] = useState(new Chess());

  // Lấy câu đố từ server
  useEffect(() => {
    fetch("http://localhost:5000/api/puzzles/random")
      .then((res) => res.json())
      .then((data) => {
        setPuzzle(data);
        const newChess = new Chess(data.fen);
        setChess(newChess);
      })
      .catch((err) => console.error("Error fetching puzzle:", err));
  }, []);

  // Kiểm tra nước đi của người dùng
  const handleMove = () => {
    if (!puzzle) return;

    try {
      const move = chess.move(userMove, { sloppy: true });
      if (move && userMove === puzzle.solution) {
        setMessage("✅ Correct move! Well done!");
      } else {
        setMessage("❌ Incorrect move! Try again.");
      }
    } catch (error) {
      setMessage("❌ Invalid move! Please enter a valid move.");
    }
  };

  // Chơi lại câu đố
  const resetPuzzle = () => {
    setChess(new Chess(puzzle.fen));
    setMessage("");
    setUserMove("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-6">Solve Chess Puzzles</h2>
      
      {puzzle ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
          <h3 className="text-lg font-semibold mb-2">{puzzle.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{puzzle.description}</p>
          
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
            placeholder="Enter your move (e.g. e4, Nf3)"
            value={userMove}
            onChange={(e) => setUserMove(e.target.value)}
          />

          <button
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            onClick={handleMove}
          >
            Submit Move
          </button>

          {message && <p className="mt-4 font-bold">{message}</p>}

          <button
            className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
            onClick={resetPuzzle}
          >
            Try Again
          </button>

          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      ) : (
        <p>Loading puzzle...</p>
      )}
    </div>
  );
}
