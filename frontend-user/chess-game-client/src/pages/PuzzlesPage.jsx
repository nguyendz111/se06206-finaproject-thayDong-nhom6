import React, { useState, useContext } from "react";
import "../style/PuzzlesPage.css";
import Square from "../components/Square";
import SideBar from "../components/SideBar"; // Sidebar
import { getPossibleMovesForPiece } from "../utils/chessLogic"; // Logic nước đi
import { ThemeLanguageContext } from "../context/ThemeLanguageContext"; // Import Context

// Dữ liệu thế cờ cho từng câu đố
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
  const { theme, language } = useContext(ThemeLanguageContext);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [board, setBoard] = useState(Array(8).fill(Array(8).fill("")));

  // Danh sách câu đố
  const allPuzzles = [
    { id: 1, difficulty: { en: "Easy", vi: "Dễ" }, title: { en: "Fool’s Mate", vi: "Chiếu Bí Nhanh" } },
    { id: 2, difficulty: { en: "Medium", vi: "Trung Bình" }, title: { en: "Fork Attack", vi: "Đòn Chĩa" } },
    { id: 3, difficulty: { en: "Hard", vi: "Khó" }, title: { en: "Zugzwang Trap", vi: "Bẫy Zugzwang" } },
  ];

  const handleSelectPuzzle = (puzzleId) => {
    setSelectedPuzzle(puzzleId);
    setBoard(puzzleBoards[puzzleId]); // Cập nhật bàn cờ theo thế cờ của câu đố
  };

  return (
    <div className={`puzzles-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
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
          <h2>{language === "en" ? "Puzzles" : "Câu đố"}</h2>

          {/* Danh sách câu đố */}
          <ul className="puzzle-list">
            {allPuzzles.map((puzzle) => (
              <li
                key={puzzle.id}
                className={`puzzle-item ${selectedPuzzle === puzzle.id ? "active" : ""}`}
                onClick={() => handleSelectPuzzle(puzzle.id)}
              >
                {puzzle.title[language]} ({puzzle.difficulty[language]})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PuzzlesPage;
