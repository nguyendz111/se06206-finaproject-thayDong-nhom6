// Square.js
import React from "react";
import pieceImages from "../assets/pieceImages";

const Square = ({ row, col, piece, isBlack, isHighlighted, onClick }) => {
  return (
    <div
      className={`square ${isBlack ? "black-square" : "white-square"} ${isHighlighted ? "highlight" : ""}`}
      onClick={() => onClick(row, col)}
    >
      {piece && <img src={pieceImages[piece]} alt={piece} className="chess-piece" />}
    </div>
  );
};

export default Square;
