import React, { useState } from "react";
import "../style/PuzzlesPage.css"; 
import Square from "../components/Square";
import SideBar from "../components/SideBar"; // Import Sidebar

const initialBoard = [
  ["rook_b", "knight_b", "bishop_b", "queen_b", "king_b", "bishop_b", "knight_b", "rook_b"],
  ["pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w"],
  ["rook_w", "knight_w", "bishop_w", "queen_w", "king_w", "bishop_w", "knight_w", "rook_w"],
];

const PuzzlesPage = () => {
  const [board] = useState(initialBoard);
  const [difficulty, setDifficulty] = useState("All");

  const allPuzzles = [
    { id: 1, difficulty: "Easy", title: "Mate in One" },
    { id: 2, difficulty: "Medium", title: "Fork Attack" },
    { id: 3, difficulty: "Hard", title: "Zugzwang Trap" },
    { id: 4, difficulty: "Easy", title: "Pin & Skewer" },
    { id: 5, difficulty: "Medium", title: "Double Check" },
  ];

  const filteredPuzzles =
    difficulty === "All"
      ? allPuzzles
      : allPuzzles.filter((puzzle) => puzzle.difficulty === difficulty);

  return (
    <div className="puzzles-container">
      {/* SideBar */}
      <SideBar />

      {/* Nội dung chính */}
      <div className="puzzles-content">
        {/* Bàn cờ bên trái */}
        <div className="puzzle-board">
          <div className="board-container">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((piece, colIndex) => (
                  <Square
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    piece={piece}
                    isBlack={(rowIndex + colIndex) % 2 === 1}
                    onClick={() => {}} 
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Hộp chứa danh sách câu đố bên phải */}
        <div className="puzzles-box">
          <h2>Puzzles</h2>

          {/* Thanh chọn độ khó */}
          <select
            className="difficulty-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Danh sách câu đố */}
          <ul className="puzzle-list">
            {filteredPuzzles.map((puzzle) => (
              <li key={puzzle.id} className="puzzle-item">
                {puzzle.title} ({puzzle.difficulty})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PuzzlesPage;
