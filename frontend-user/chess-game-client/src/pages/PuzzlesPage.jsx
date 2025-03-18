import React from "react";
import Board from "../components/Board"; // Import Board vào trang PuzzlesPage

const PuzzlesPage = () => {
  return (
    <div className="puzzles-container">
      <h2>Chess Puzzles</h2>
      <Board /> {/* Hiển thị bàn cờ giống trang chơi online */}
    </div>
  );
};

export default PuzzlesPage;
