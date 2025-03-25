import React, { useState } from "react";
import "../style/PuzzlesPage.css"; 
import Square from "../components/Square";
import SideBar from "../components/SideBar"; // Import Sidebar
import { getPossibleMovesForPiece } from "../utils/chessLogic"; // Import logic nước đi

// Dữ liệu các thế cờ cho từng câu đố
const puzzleBoards = {
  1: [ // Fool’s Mate
    ["rook_b", "knight_b", "bishop_b", "queen_b", "king_b", "bishop_b", "knight_b", "rook_b"],
    ["pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b", "", "", "pawn_b"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "pawn_b", "pawn_b", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["pawn_w", "pawn_w", "pawn_w", "pawn_w", "", "pawn_w", "pawn_w", "pawn_w"],
    ["rook_w", "knight_w", "bishop_w", "queen_w", "king_w", "bishop_w", "knight_w", "rook_w"],
  ],
  2: [ // Fork Attack
    ["", "", "", "", "", "", "king_b", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "knight_w", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "king_w", "", "", "", ""],
  ],
  3: [ // Zugzwang Trap
    ["", "", "", "", "king_b", "", "", ""],
    ["", "", "", "bishop_w", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "king_w", "", "", ""],
  ],
};

const PuzzlesPage = () => {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [board, setBoard] = useState(Array(8).fill(Array(8).fill("")));

  const allPuzzles = [
    { id: 1, difficulty: "Easy", title: "Fool’s Mate" },
    { id: 2, difficulty: "Medium", title: "Fork Attack" },
    { id: 3, difficulty: "Hard", title: "Zugzwang Trap" },
  ];

  const handleSelectPuzzle = (puzzleId) => {
    setSelectedPuzzle(puzzleId);
    setBoard(puzzleBoards[puzzleId]); // Cập nhật bàn cờ theo thế cờ của câu đố
  };

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
                    onClick={() => {
                      if (piece) {
                        const moves = getPossibleMovesForPiece(
                          { type: piece.split("_")[0], color: piece.split("_")[1] },
                          [rowIndex, colIndex],
                          board
                        );
                        console.log(`Nước đi hợp lệ cho ${piece}:`, moves);
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Hộp chứa danh sách câu đố bên phải */}
        <div className="puzzles-box">
          <h2>Puzzles</h2>

          {/* Danh sách câu đố */}
          <ul className="puzzle-list">
            {allPuzzles.map((puzzle) => (
              <li
                key={puzzle.id}
                className={`puzzle-item ${selectedPuzzle === puzzle.id ? "active" : ""}`}
                onClick={() => handleSelectPuzzle(puzzle.id)}
              >
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