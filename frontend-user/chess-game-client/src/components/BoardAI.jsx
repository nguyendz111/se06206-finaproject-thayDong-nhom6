import React, { useState, useEffect } from "react";
import "../App.css";
import { getPossibleMovesForPiece } from "../utils/chessLogic";
import { getBestMove } from "../utils/AI";
import Square from "./Square";
import { useNavigate } from "react-router-dom";
import "../style/Board.css";

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

const BoardAI = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [turn, setTurn] = useState("w");
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [difficulty, setDifficulty] = useState(localStorage.getItem("difficulty") || "medium"); // Lấy từ LocalStorage
  const navigate = useNavigate();

  // Lưu độ khó vào LocalStorage và reset game bằng reload
  const resetGameWithDifficulty = (newDifficulty) => {
    localStorage.setItem("difficulty", newDifficulty);
    window.location.reload(); // Giữ hiệu ứng reload như cũ
  };

  useEffect(() => {
    if (turn === "b" && !winner) {
      setIsAIThinking(true);
      setTimeout(() => {
        handleAIMove();
        setIsAIThinking(false);
      }, 2000);
    }
  }, [turn, difficulty]);

  const handleSquareClick = (row, col) => {
    if (winner || turn === "b") return;
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
      const newBoard = board.map(r => [...r]);
      const capturedPiece = newBoard[row][col];

      if (capturedPiece) {
        const color = capturedPiece.endsWith("_b") ? "black" : "white";
        setCapturedPieces(prev => ({
          ...prev,
          [color]: [...prev[color], capturedPiece],
        }));
      }

      if (capturedPiece && capturedPiece.includes("king")) {
        setWinner(turn === "w" ? "White wins!" : "Black wins!");
        return;
      }

      newBoard[row][col] = selectedPiece;
      newBoard[selectedPosition[0]][selectedPosition[1]] = "";

      setBoard(newBoard);
      setTurn("b");
    }
    setSelectedPiece(null);
    setSelectedPosition(null);
    setPossibleMoves([]);
  };

  const handleAIMove = () => {
    const bestMove = getBestMove(board, "b", difficulty);
    if (!bestMove || !bestMove.from || !bestMove.to) return;
  
    const newBoard = board.map(r => [...r]);
    const { from, to } = bestMove;
    const capturedPiece = newBoard[to[0]][to[1]];

    if (capturedPiece) {
      const color = capturedPiece.endsWith("_w") ? "white" : "black";
      setCapturedPieces(prev => ({
        ...prev,
        [color]: [...prev[color], capturedPiece],
      }));
    }

    if (capturedPiece && capturedPiece.includes("king")) {
      setWinner("Black wins!");
      return;
    }

    newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
    newBoard[from[0]][from[1]] = "";

    setBoard(newBoard);
    setTurn("w");
  };

  return (
    <div className="game-container">
      <div className="captured-pieces captured-black">
        {capturedPieces.white.map((piece, index) => (
          <img key={index} src={require(`../assets/images/${piece}.png`)} alt={piece} className="captured-piece" />
        ))}
      </div>

      <div className="board-wrapper">
        <div className="board-content">
          <h2>Play: {turn === "w" ? "White" : "Black"}</h2>
          <h3>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h3>
          {isAIThinking && <p className="text-yellow-500">AI is thinking...</p>}
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

        {/* Nút chơi lại */}
        <button className="restart-button" onClick={() => resetGameWithDifficulty(difficulty)}>
          Play Again?
        </button>

        {/* Chọn độ khó */}
        <div className="difficulty-select">
          <label htmlFor="difficulty">Select Difficulty: </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => resetGameWithDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="captured-pieces captured-white">
        {capturedPieces.black.map((piece, index) => (
          <img key={index} src={require(`../assets/images/${piece}.png`)} alt={piece} className="captured-piece" />
        ))}
      </div>

      {winner && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>{winner}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardAI;
