import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Square from "./Square";
import "../style/Board.css";

const socket = io("http://localhost:5000");

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

const BoardOnline = () => {
  const { roomId } = useParams();
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState("w");
  const [playerColor, setPlayerColor] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("gameState", ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
    });

    socket.on("assignColor", (color) => {
      setPlayerColor(color);
    });

    socket.on("opponent-move", ({ from, to }) => {
      setBoard((prevBoard) => {
        const newBoard = prevBoard.map((row) => [...row]);
        newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
        newBoard[from[0]][from[1]] = "";
        return newBoard;
      });

      setTurn((prevTurn) => (prevTurn === "w" ? "b" : "w"));
    });

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("gameState");
      socket.off("assignColor");
      socket.off("opponent-move");
    };
  }, [roomId]);

  const handleSquareClick = (row, col) => {
    if (playerColor !== turn) return;

    const piece = board[row][col];

    if (selectedPiece) {
      handleMove(row, col);
    } else if (piece && piece.endsWith(`_${playerColor}`)) {
      setSelectedPiece(piece);
      setSelectedPosition([row, col]);
    }
  };

  const handleMove = (row, col) => {
    if (!selectedPiece || !selectedPosition) return;

    socket.emit("move", { roomId, from: selectedPosition, to: [row, col] });

    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      newBoard[col][row] = newBoard[selectedPosition[0]][selectedPosition[1]];
      newBoard[selectedPosition[0]][selectedPosition[1]] = "";
      return newBoard;
    });

    setTurn((prevTurn) => (prevTurn === "w" ? "b" : "w"));

    setSelectedPiece(null);
    setSelectedPosition(null);
  };

  return (
    <div className="game-container">
      <h2>Multiplayer Chess - Room: {roomId}</h2>
      <h3>Your color: {playerColor === "w" ? "White" : "Black"}</h3>
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
                isHighlighted={selectedPosition && selectedPosition[0] === rowIndex && selectedPosition[1] === colIndex}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardOnline;
