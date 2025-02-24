import React, { useState } from "react";
import "../App.css";
import { getPossibleMovesForPiece } from "../moves";
import pieceImages from "../assets/pieceImages";



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

const GameBoard = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [turn, setTurn] = useState("w");
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [winner, setWinner] = useState(null);  // Thêm trạng thái để theo dõi người thắng

  const handleSquareClick = (row, col) => {
    if (winner) return; // Không cho phép di chuyển sau khi kết thúc game

    const piece = board[row][col];

    if (selectedPiece) {
      handleMove(row, col);
    } else if (piece && piece.endsWith(`_${turn}`)) {
      setSelectedPiece(piece);
      setSelectedPosition([row, col]);
      const [type, color] = piece.split("_");
      const moves = getPossibleMovesForPiece({ type, color }, [row, col], board);
      setPossibleMoves(moves);
    }
  };

  const handleMove = (row, col) => {
    if (!selectedPiece || !selectedPosition) return;

    if (possibleMoves.some(move => move[0] === row && move[1] === col)) {
      const newBoard = board.map(r => r.slice());
      const capturedPiece = newBoard[row][col];

      newBoard[row][col] = selectedPiece;
      newBoard[selectedPosition[0]][selectedPosition[1]] = "";

      // Kiểm tra nếu vua bị ăn
      if (capturedPiece.includes("king")) {
        setWinner(turn === "w" ? "White wins!" : "Black wins!");
        return;
      }

      setBoard(newBoard);
      setTurn(turn === "w" ? "b" : "w");
    }

    setSelectedPiece(null);
    setSelectedPosition(null);
    setPossibleMoves([]);
  };
  const renderSquare = (row, col) => {
    const isBlack = (row + col) % 2 === 1;
    const piece = board[row][col];
    const isHighlighted = possibleMoves.some(move => move[0] === row && move[1] === col);

    return (
      <div
        key={`${row}-${col}`}
        className={`square ${isBlack ? "black-square" : "white-square"} ${isHighlighted ? "highlight" : ""}`}
        onClick={() => handleSquareClick(row, col)}
      >
        {piece && <img src={pieceImages[piece]} alt={piece} className="chess-piece" />}
      </div>
    );
  };

  return (
    <div className="game-container">
      <h2>Play: {turn === "w" ? "white" : "black"}</h2>
      <div className="board-container">{board.map((row, rowIndex) => <div key={rowIndex} className="row">{row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}</div>)}</div>

      {/* Hiển thị thông báo thắng/thua */}
      {winner && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>{winner}</h2>
            <button className="restart-button" onClick={() => window.location.reload()}>Play Again?</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
