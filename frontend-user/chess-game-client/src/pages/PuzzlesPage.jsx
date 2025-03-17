import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SolvePuzzlesPage() {
  const navigate = useNavigate();
  const puzzles = [
    {
      id: 1,
      fen: "8/8/8/8/8/8/8/K6k w - - 0 1", // Ví dụ trạng thái bàn cờ theo FEN
      solution: ["Ka2", "Ka3"], // Danh sách nước đi đúng
    },
    {
      id: 2,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      solution: ["e4", "d4"],
    },
  ];

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userMove, setUserMove] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleCheckMove = () => {
    if (puzzles[currentPuzzle].solution.includes(userMove)) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback("❌ Incorrect, try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">
        {`Puzzle ${currentPuzzle + 1}`}
      </h2>
      {/* Hiển thị bàn cờ - Placeholder */}
      <div className="w-64 h-64 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
        {puzzles[currentPuzzle].fen}
      </div>

      {/* Nhập nước đi */}
      <input
        type="text"
        className="mt-4 p-2 border rounded"
        placeholder="Enter your move (e.g., e4)"
        value={userMove}
        onChange={(e) => setUserMove(e.target.value)}
      />

      {/* Kiểm tra nước đi */}
      <button
        className="mt-2 p-2 bg-green-600 text-white rounded flex items-center gap-2"
        onClick={handleCheckMove}
      >
        <FaCheck /> Check Move
      </button>

      <p className="mt-2">{feedback}</p>

      {/* Điều hướng giữa các bài toán */}
      <div className="mt-4 flex gap-4">
        <button
          className="p-2 bg-blue-600 text-white rounded"
          disabled={currentPuzzle === 0}
          onClick={() => {
            setCurrentPuzzle((prev) => prev - 1);
            setFeedback("");
            setUserMove("");
          }}
        >
          <FaArrowLeft /> Previous
        </button>
        <button
          className="p-2 bg-blue-600 text-white rounded"
          disabled={currentPuzzle === puzzles.length - 1}
          onClick={() => {
            setCurrentPuzzle((prev) => prev + 1);
            setFeedback("");
            setUserMove("");
          }}
        >
          Next <FaArrowRight />
        </button>
      </div>

      {/* Nút quay lại trang chủ */}
      <button className="mt-6 p-2 bg-red-600 text-white rounded flex items-center gap-2" onClick={() => navigate("/")}>
        <FaArrowLeft /> Back to Home
      </button>
    </div>
  );
}
