import React, { useState } from "react";
import "../App.css";
import { getPossibleMovesForPiece } from "../utils/chessLogic";
import Square from "./Square";
import { useNavigate } from "react-router-dom";
import "../style/Board.css";
import playerIcon from "../assets/images/hand-chess.png";
import aiIcon from "../assets/images/computer-icon.png";

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

const Board = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [turn, setTurn] = useState("w");
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const navigate = useNavigate();

  const handleSquareClick = (row, col) => {
    if (winner) return;
    const piece = board[row][col];
    if (selectedPiece) {
      handleMove(row, col);
    } else if (piece && piece.endsWith(`_${turn}`)) {
      setSelectedPiece(piece);
      setSelectedPosition([row, col]);
      const [type, color] = piece.split("_");
      setPossibleMoves(getPossibleMovesForPiece({ type, color }, [row, col], board));
    }
  };

  const handleMove = (row, col) => {
    if (!selectedPiece || !selectedPosition) return;
    if (possibleMoves.some(move => move[0] === row && move[1] === col)) {
      const newBoard = board.map(r => r.slice());
      const capturedPiece = newBoard[row][col];
      newBoard[row][col] = selectedPiece;
      newBoard[selectedPosition[0]][selectedPosition[1]] = "";
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

  return (
    <div className="game-container">
      <div className="board-wrapper">
        <div className="board-content">
          <h2>Play: {turn === "w" ? "White" : "Black"}</h2>
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
                    isHighlighted={possibleMoves.some(move => move[0] === rowIndex && move[1] === colIndex)}
                    onClick={handleSquareClick}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Nút chọn chế độ chơi */}
        <div className="mode-selection">
          <button className="play-button online" onClick={() => navigate("/multiplayer")}>
            <img src={playerIcon} alt="Player Icon" className="icon" />
            Play Online
          </button>
          <button className="play-button computer" onClick={() => navigate("/play-ai")}>
            <img src={aiIcon} alt="AI Icon" className="icon" />
            Play Computer
          </button>
        </div>
      </div>

      {winner && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>{winner}</h2>
            <button className="restart-button" onClick={() => window.location.reload()}>
              Play Again?
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
