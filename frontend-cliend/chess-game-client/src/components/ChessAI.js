import React, { useState, useEffect, useRef } from "react";
import "./board.css";
import pieceImages from "../images/pieceImages";

// Define piece values for evaluation (used in AI scoring)
const pieceValues = {
  pawn: 1,
  knight: 3,
  bishop: 3.5,
  rook: 5,
  queen: 9,
  king: 1000,
};

// Positional values for pawns (used to encourage pawn advancement)
const positionValues = {
  pawn: [
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 5, 10, 15, 15, 10, 5, 0],
  ],
};

// Transposition table to cache board evaluations (optimization for minimax)
const transpositionTable = new Map();

// Initial chessboard setup (8x8 grid)
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

// Initial castling rights for both players (white and black)
const initialCastlingRights = {
  w: { kingMoved: false, leftRookMoved: false, rightRookMoved: false },
  b: { kingMoved: false, leftRookMoved: false, rightRookMoved: false },
};

// Check if a pawn move is a promotion (pawn reaching the opponent's back rank)
function isPromotionMove(piece, fromRow, toRow, color) {
  return piece.startsWith("pawn") && ((color === "w" && toRow === 0) || (color === "b" && toRow === 7));
}

// Promote a pawn to a new piece type (e.g., queen, rook, bishop, knight)
function promotePawn(row, col, board, color, newPieceType) {
  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = `${newPieceType}_${color}`;
  return newBoard;
}

// Get all possible moves for a specific piece at a given position
function getPossibleMovesForPiece(piece, position, board, castlingRights = {}, lastMove = null, skipCheck = false) {
  const [row, col] = position;
  const { type, color } = piece;
  let moves = [];

  if (type === "pawn") moves = getPawnMoves(row, col, color, board, lastMove);
  if (type === "rook") moves = getStraightLineMoves(row, col, board);
  if (type === "bishop") moves = getDiagonalMoves(row, col, board);
  if (type === "queen") moves = [...getStraightLineMoves(row, col, board), ...getDiagonalMoves(row, col, board)];
  if (type === "knight") moves = getKnightMoves(row, col, board);
  if (type === "king") moves = getKingMoves(row, col, board, castlingRights);

  if (!skipCheck) {
    return moves.filter(move => {
      const newBoard = simulateMove(board, position, move);
      return !isKingInCheck(newBoard, color);
    });
  }
  return moves;
}

// Get possible moves for a pawn (including forward moves, captures, and en passant)
const getPawnMoves = (row, col, color, board, lastMove) => {
  let moves = [];
  const direction = color === "w" ? -1 : 1;
  const startRow = color === "w" ? 6 : 1;

  if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
    moves.push([row + direction, col]);
    if (row === startRow && row + 2 * direction >= 0 && row + 2 * direction < 8 && !board[row + 2 * direction][col]) {
      moves.push([row + 2 * direction, col]);
    }
  }

  if (col > 0 && row + direction >= 0 && row + direction < 8 && board[row + direction][col - 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
    moves.push([row + direction, col - 1]);
  }
  if (col < 7 && row + direction >= 0 && row + direction < 8 && board[row + direction][col + 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
    moves.push([row + direction, col + 1]);
  }

  const enPassantRow = color === "w" ? 3 : 4;
  if (row === enPassantRow && lastMove && lastMove.piece === `pawn_${color === "w" ? "b" : "w"}` && 
      lastMove.from && lastMove.to && Math.abs(lastMove.from[0] - lastMove.to[0]) === 2) {
    const [lastToRow, lastToCol] = lastMove.to;
    if (lastToRow === row && Math.abs(lastToCol - col) === 1) {
      moves.push([row + direction, lastToCol]);
    }
  }

  return moves;
};

// Get possible moves for a rook (horizontal and vertical)
const getStraightLineMoves = (row, col, board) => {
  let moves = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  
  for (const [dr, dc] of directions) {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (!board[r][c]) {
        moves.push([r, c]);
      } else {
        if (board[r][c].endsWith("_w") !== board[row][col].endsWith("_w")) {
          moves.push([r, c]);
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
};

// Get possible moves for a bishop (diagonal)
const getDiagonalMoves = (row, col, board) => {
  let moves = [];
  const directions = [[1, 1], [-1, -1], [1, -1], [-1, 1]];

  for (const [dr, dc] of directions) {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (!board[r][c]) {
        moves.push([r, c]);
      } else {
        if (board[r][c].endsWith("_w") !== board[row][col].endsWith("_w")) {
          moves.push([r, c]);
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
};

// Get possible moves for a knight (L-shaped moves)
const getKnightMoves = (row, col, board) => {
  const moves = [];
  const deltas = [
    [-2, -1], [-2, 1], [2, -1], [2, 1],
    [-1, -2], [-1, 2], [1, -2], [1, 2],
  ];

  for (const [dr, dc] of deltas) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
      moves.push([r, c]);
    }
  }
  return moves;
};

// Get possible moves for a king (including castling)
const getKingMoves = (row, col, board, castlingRights) => {
  const moves = [];
  const deltas = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  for (const [dr, dc] of deltas) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
      moves.push([r, c]);
    }
  }

  const color = board[row][col].endsWith("_w") ? "w" : "b";
  if (castlingRights[color] && !castlingRights[color].kingMoved) {
    // Nhập thành bên phải (kingside castling)
    if (!castlingRights[color].rightRookMoved && !board[row][5] && !board[row][6]) {
      if (
        !isKingInCheck(board, color) && 
        !isKingInCheck(simulateMove(board, [row, col], [row, 5]), color) && 
        !isKingInCheck(simulateMove(board, [row, col], [row, 6]), color)
      ) {
        moves.push([row, 6]);
      }
    }
    // Nhập thành bên trái (queenside castling)
    if (!castlingRights[color].leftRookMoved && !board[row][3] && !board[row][2] && !board[row][1]) {
      if (
        !isKingInCheck(board, color) && 
        !isKingInCheck(simulateMove(board, [row, col], [row, 3]), color) && 
        !isKingInCheck(simulateMove(board, [row, col], [row, 2]), color)
      ) {
        moves.push([row, 2]);
      }
    }
  }

  return moves;
};

// Check if the king of a given color is in check
function isKingInCheck(board, color) {
  let kingPos;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === `king_${color}`) {
        kingPos = [r, c];
        break;
      }
    }
  }

  const opponentColor = color === "w" ? "b" : "w";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.endsWith(`_${opponentColor}`)) {
        const piece = { type: board[r][c].split("_")[0], color: opponentColor };
        const moves = getPossibleMovesForPiece(piece, [r, c], board, {}, null, true);
        if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Simulate a move on a copy of the board (for checking legality)
function simulateMove(board, from, to) {
  const newBoard = board.map(row => [...row]);
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  return newBoard;
}

// AI: Find the best move for a given color using minimax
function getBestMove(board, color, difficulty = "medium") {
  let bestMove = null;
  let bestValue = -Infinity;

  const possibleMoves = getAllPossibleMoves(board, color);
  const depth = getDepthByDifficulty(difficulty, board);

  for (let move of possibleMoves) {
    const newBoard = makeMove(board, move);
    const moveValue = minimax(newBoard, depth, false, color, -Infinity, Infinity);
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }
  return bestMove;
}

// Get all possible moves for a given color (used by AI)
function getAllPossibleMoves(board, color) {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.endsWith(`_${color}`)) {
        const [type] = piece.split("_");
        const possibleMoves = getPossibleMovesForPiece(
          { type, color },
          [row, col],
          board
        );
        for (let move of possibleMoves) {
          const isCapture = board[move[0]][move[1]] !== "";
          const captureValue = isCapture ? pieceValues[board[move[0]][move[1]].split("_")[0]] : 0;
          moves.push({ from: [row, col], to: move, isCapture, captureValue });
        }
      }
    }
  }

  moves.sort((a, b) => b.captureValue - a.captureValue);
  return moves;
}

// Make a move on a copy of the board (used by AI)
function makeMove(board, move) {
  const newBoard = board.map((r) => [...r]);
  newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
  newBoard[move.from[0]][move.from[1]] = "";
  return newBoard;
}

// Minimax algorithm with alpha-beta pruning (AI decision-making)
function minimax(board, depth, isMaximizing, color, alpha, beta) {
  const boardHash = JSON.stringify(board);
  if (transpositionTable.has(boardHash)) {
    return transpositionTable.get(boardHash);
  }

  if (depth === 0) return evaluateBoard(board, color);

  const opponentColor = color === "w" ? "b" : "w";
  const possibleMoves = getAllPossibleMoves(board, isMaximizing ? color : opponentColor);

  if (possibleMoves.length === 0) return evaluateBoard(board, color);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of possibleMoves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, false, color, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    transpositionTable.set(boardHash, maxEval);
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of possibleMoves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, true, color, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    transpositionTable.set(boardHash, minEval);
    return minEval;
  }
}

// Evaluate the board state (used by AI to score positions)
function evaluateBoard(board, color) {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const [type, pieceColor] = piece.split("_");
        const pieceValue = pieceValues[type] || 0;
        let positionalValue = positionValues[type] ? positionValues[type][row][col] : 0;
        score += (pieceValue + positionalValue) * (pieceColor === color ? 1 : -1);
      }
    }
  }
  return score;
}

// Determine the search depth for minimax based on difficulty and piece count
function getDepthByDifficulty(difficulty, board) {
  const pieceCount = board.flat().filter((piece) => piece !== "").length;

  if (difficulty === "easy") return 2;
  if (difficulty === "medium") return pieceCount > 20 ? 3 : 4;
  if (difficulty === "hard") {
    if (pieceCount > 24) return 4;
    if (pieceCount > 16) return 5;
    return 6;
  }
  return 3;
}

// Square component to render individual squares on the board
const Square = ({ row, col, piece, isBlack, isHighlighted, isKingInCheck, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const squareStyle = {
    width: "60px",
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isKingInCheck
      ? "rgba(255, 0, 0, 0.7)"
      : isHighlighted
      ? "yellow"
      : isBlack
      ? isHovered
        ? "#8ba769"
        : "#769656"
      : isHovered
      ? "#f0f0f0"
      : "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  };

  const pieceStyle = {
    width: "100%",
    height: "100%",
  };

  return (
    <div
      style={squareStyle}
      onClick={() => onClick(row, col)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {piece && <img src={pieceImages[piece]} alt={piece} style={pieceStyle} />}
    </div>
  );
};

// Main ChessAI component
const ChessAI = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [turn, setTurn] = useState("w");
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [castlingRights, setCastlingRights] = useState(initialCastlingRights);
  const [lastMove, setLastMove] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionPosition, setPromotionPosition] = useState(null);
  const [kingInCheck, setKingInCheck] = useState(null);
  const [difficulty] = useState("medium");
  const [whiteTotal, setWhiteTotal] = useState(600);
  const [blackTotal, setBlackTotal] = useState(600);
  const [whiteMove, setWhiteMove] = useState(120);
  const [blackMove, setBlackMove] = useState(120);
  const [checkMessage, setCheckMessage] = useState(null);

  const timerIntervalRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (!winner && !isPromoting) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        if (turn === "w") {
          setWhiteTotal((prev) => (prev > 0 ? prev - 1 : 0));
          setWhiteMove((prev) => (prev > 0 ? prev - 1 : 0));

          if (whiteTotal <= 1 && blackTotal <= 1) {
            setWinner("Hòa!");
            clearInterval(timerIntervalRef.current);
          } else if (whiteTotal <= 0 || whiteMove <= 0) {
            setWinner("Bạn đã thua!");
            clearInterval(timerIntervalRef.current);
          }
        } else {
          setBlackTotal((prev) => (prev > 0 ? prev - 1 : 0));
          setBlackMove((prev) => (prev > 0 ? prev - 1 : 0));

          if (whiteTotal <= 1 && blackTotal <= 1) {
            setWinner("Hòa!");
            clearInterval(timerIntervalRef.current);
          } else if (blackTotal <= 0 || blackMove <= 0) {
            setWinner("Bạn đã thắng!");
            clearInterval(timerIntervalRef.current);
          }
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [turn, winner, isPromoting, whiteTotal, blackTotal, whiteMove, blackMove]);

  const checkForCheckmate = (board, color) => {
    const moves = getAllPossibleMoves(board, color);
    console.log(`Checkmate check for ${color}: possible moves =`, moves); // Debug
    return moves.length === 0 && isKingInCheck(board, color);
  };

  const checkForStalemate = (board, color) => {
    if (isKingInCheck(board, color)) return false; // Không phải stalemate nếu vua đang bị chiếu
    const moves = getAllPossibleMoves(board, color);
    console.log(`Stalemate check for ${color}: possible moves =`, moves); // Debug
    return moves.length === 0; // Stalemate nếu không có nước đi hợp lệ và không bị chiếu
  };

  const handleSquareClick = (row, col) => {
    if (winner || isPromoting || turn === "b") return;
    const piece = board[row][col];
    if (selectedPiece) {
      handleMove(row, col);
    } else if (piece && piece.endsWith(`_w`)) {
      setSelectedPiece(piece);
      setSelectedPosition([row, col]);
      const [type, color] = piece.split("_");
      setPossibleMoves(getPossibleMovesForPiece({ type, color }, [row, col], board, castlingRights, lastMove));
    }
  };

  const handleMove = (row, col) => {
    if (!selectedPiece || !selectedPosition) return;
    if (possibleMoves.some((move) => move[0] === row && move[1] === col)) {
      const newBoard = board.map((r) => r.slice());
      const [fromRow, fromCol] = selectedPosition;
      const color = selectedPiece.endsWith("_w") ? "w" : "b";

      if (selectedPiece === `king_${color}`) {
        setCastlingRights((prev) => ({
          ...prev,
          [color]: { ...prev[color], kingMoved: true },
        }));
        if (Math.abs(col - fromCol) === 2) {
          if (col === 6) {
            newBoard[fromRow][7] = "";
            newBoard[fromRow][5] = `rook_${color}`;
          } else if (col === 2) {
            newBoard[fromRow][0] = "";
            newBoard[fromRow][3] = `rook_${color}`;
          }
        }
      } else if (selectedPiece === `rook_${color}`) {
        setCastlingRights((prev) => ({
          ...prev,
          [color]: {
            ...prev[color],
            ...(fromCol === 0 && { leftRookMoved: true }),
            ...(fromCol === 7 && { rightRookMoved: true }),
          },
        }));
      }

      newBoard[row][col] = selectedPiece;
      newBoard[fromRow][fromCol] = "";

      const enPassantRow = color === "w" ? 3 : 4;
      if (
        selectedPiece.startsWith("pawn") &&
        fromRow === enPassantRow &&
        Math.abs(fromCol - col) === 1 &&
        !newBoard[row][col]
      ) {
        if (lastMove && lastMove.to) {
          newBoard[lastMove.to[0]][lastMove.to[1]] = "";
        }
      }

      if (isPromotionMove(selectedPiece, fromRow, row, color)) {
        setPromotionPosition([row, col]);
        setIsPromoting(true);
        setBoard(newBoard);
        setLastMove({ from: selectedPosition, to: [row, col], piece: selectedPiece });
      } else {
        setBoard(newBoard);
        setLastMove({ from: selectedPosition, to: [row, col], piece: selectedPiece });

        if (isKingInCheck(newBoard, "b")) {
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (newBoard[r][c] === `king_b`) {
                setKingInCheck([r, c]);
                setCheckMessage("Chiếu tướng!");
                setTimeout(() => setCheckMessage(null), 1000);
                if (checkForCheckmate(newBoard, "b")) {
                  console.log("Player wins by checkmate!");
                  setWinner("Bạn đã thắng!");
                  return;
                }
                break;
              }
            }
          }
        } else {
          setKingInCheck(null);
          if (checkForStalemate(newBoard, "b")) {
            console.log("Player wins due to stalemate of black!");
            setWinner("Bạn đã thắng!");
            return;
          }
        }

        setTurn("b");
        setWhiteMove(120);
      }
    }
    setSelectedPiece(null);
    setSelectedPosition(null);
    setPossibleMoves([]);
  };

  useEffect(() => {
    console.log("Winner state:", winner); // Debug
    if (turn === "b" && !winner && !isPromoting) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board, "b", difficulty);
        if (bestMove) {
          const newBoard = board.map((r) => r.slice());
          const { from, to } = bestMove;
          const piece = newBoard[from[0]][from[1]];

          const color = "b";
          if (piece === `king_${color}`) {
            setCastlingRights((prev) => ({
              ...prev,
              [color]: { ...prev[color], kingMoved: true },
            }));
            if (Math.abs(to[1] - from[1]) === 2) {
              if (to[1] === 6) {
                newBoard[from[0]][7] = "";
                newBoard[from[0]][5] = `rook_${color}`;
              } else if (to[1] === 2) {
                newBoard[from[0]][0] = "";
                newBoard[from[0]][3] = `rook_${color}`;
              }
            }
          } else if (piece === `rook_${color}`) {
            setCastlingRights((prev) => ({
              ...prev,
              [color]: {
                ...prev[color],
                ...(from[1] === 0 && { leftRookMoved: true }),
                ...(from[1] === 7 && { rightRookMoved: true }),
              },
            }));
          }

          newBoard[to[0]][to[1]] = piece;
          newBoard[from[0]][from[1]] = "";

          if (
            piece.startsWith("pawn") &&
            from[0] === 4 &&
            Math.abs(from[1] - to[1]) === 1 &&
            !newBoard[to[0]][to[1]]
          ) {
            if (lastMove && lastMove.to) {
              newBoard[lastMove.to[0]][lastMove.to[1]] = "";
            }
          }

          if (isPromotionMove(piece, from[0], to[0], "b")) {
            newBoard[to[0]][to[1]] = `queen_b`;
            setBoard(newBoard);
            setTurn("w");
            setLastMove({ from, to, piece });

            if (isKingInCheck(newBoard, "w")) {
              for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                  if (newBoard[r][c] === `king_w`) {
                    setKingInCheck([r, c]);
                    setCheckMessage("Chiếu tướng!");
                    setTimeout(() => setCheckMessage(null), 1000);
                    if (checkForCheckmate(newBoard, "w")) {
                      console.log("AI wins by checkmate!");
                      setWinner("Bạn đã thua!");
                      return;
                    }
                    break;
                  }
                }
              }
            } else {
              setKingInCheck(null);
              if (checkForStalemate(newBoard, "w")) {
                console.log("AI wins due to stalemate of white!");
                setWinner("Bạn đã thua!");
                return;
              }
            }

            setBlackMove(120);
          } else {
            setBoard(newBoard);
            setTurn("w");
            setLastMove({ from, to, piece });

            if (isKingInCheck(newBoard, "w")) {
              for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                  if (newBoard[r][c] === `king_w`) {
                    setKingInCheck([r, c]);
                    setCheckMessage("Chiếu tướng!");
                    setTimeout(() => setCheckMessage(null), 1000);
                    if (checkForCheckmate(newBoard, "w")) {
                      console.log("AI wins by checkmate!");
                      setWinner("Bạn đã thua!");
                      return;
                    }
                    break;
                  }
                }
              }
            } else {
              setKingInCheck(null);
              if (checkForStalemate(newBoard, "w")) {
                console.log("AI wins due to stalemate of white!");
                setWinner("Bạn đã thua!");
                return;
              }
            }

            setBlackMove(120);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [turn, board, winner, isPromoting, difficulty, lastMove]);

  const handlePromotion = (newPieceType) => {
    if (promotionPosition) {
      const [row, col] = promotionPosition;
      const color = turn === "w" ? "w" : "b";
      const updatedBoard = promotePawn(row, col, board, color, newPieceType);
      setBoard(updatedBoard);
      setTurn(turn === "w" ? "b" : "w");
      setIsPromoting(false);
      setPromotionPosition(null);

      const opponentColor = color === "w" ? "b" : "w";
      if (isKingInCheck(updatedBoard, opponentColor)) {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (updatedBoard[r][c] === `king_${opponentColor}`) {
              setKingInCheck([r, c]);
              setCheckMessage("Chiếu tướng!");
              setTimeout(() => setCheckMessage(null), 1000);
              if (checkForCheckmate(updatedBoard, opponentColor)) {
                console.log(`${color === "w" ? "Player" : "AI"} wins by checkmate after promotion!`);
                setWinner(color === "w" ? "Bạn đã thắng!" : "Bạn đã thua!");
                return;
              }
              break;
            }
          }
        }
      } else {
        setKingInCheck(null);
        if (checkForStalemate(updatedBoard, opponentColor)) {
          console.log(`${color === "w" ? "Player" : "AI"} wins due to stalemate after promotion!`);
          setWinner(color === "w" ? "Bạn đã thắng!" : "Bạn đã thua!");
          return;
        }
      }
    }
  };

  const promotionOptions = {
    w: [
      { type: "queen", img: pieceImages.queen_w },
      { type: "rook", img: pieceImages.rook_w },
      { type: "bishop", img: pieceImages.bishop_w },
      { type: "knight", img: pieceImages.knight_w },
    ],
    b: [
      { type: "queen", img: pieceImages.queen_b },
      { type: "rook", img: pieceImages.rook_b },
      { type: "bishop", img: pieceImages.bishop_b },
      { type: "knight", img: pieceImages.knight_b },
    ],
  };

  return (
    <div className="game-container">
      <div className="info-panel">
        <h2>Chess AI</h2>
        <div className="game-info">
          <div className="turn-info">
            <span>Lượt: {turn === "w" ? "Trắng" : "Đen"}</span>
          </div>
          <div className="timers">
            <div className="timer white-timer">
              <div className="timer-label">Trắng:</div>
              <div className="timer-time">
                <div className="total-time">{formatTime(whiteTotal)}</div>
                <div className="move-time">{formatTime(whiteMove)}</div>
              </div>
            </div>
            <div className="timer black-timer">
              <div className="timer-label">Đen:</div>
              <div className="timer-time">
                <div className="total-time">{formatTime(blackTotal)}</div>
                <div className="move-time">{formatTime(blackMove)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="board-wrapper">
        <div className="board-content">
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
                    isHighlighted={possibleMoves.some(
                      (move) => move[0] === rowIndex && move[1] === colIndex
                    )}
                    isKingInCheck={
                      kingInCheck &&
                      kingInCheck[0] === rowIndex &&
                      kingInCheck[1] === colIndex
                    }
                    onClick={handleSquareClick}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {checkMessage && (
        <div className="check-message-overlay">
          <div className="check-message">
            <h2>{checkMessage}</h2>
          </div>
        </div>
      )}

      {winner && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>{winner}</h2>
            <div className="game-over-buttons">
              <button
                className="home-button"
                onClick={() => (window.location.href = "/home")}
              >
                Quay về trang chủ
              </button>
              <button
                className="restart-button"
                onClick={() => window.location.reload()}
              >
                Chơi lại
              </button>
            </div>
          </div>
        </div>
      )}

      {isPromoting && (
        <div className="promotion-overlay">
          <div className="promotion-modal">
            <h3>Chọn quân để phong cấp</h3>
            <div className="promotion-options">
              {promotionOptions[turn].map((option) => (
                <img
                  key={option.type}
                  src={option.img}
                  alt={option.type}
                  className="promotion-piece"
                  onClick={() => handlePromotion(option.type)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessAI;