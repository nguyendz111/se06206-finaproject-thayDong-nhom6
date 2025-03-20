import { getPossibleMovesForPiece } from "./chessLogic";

const pieceValues = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 1000,
};

export function getBestMove(board, color, difficulty = "medium") {
  let bestMove = null;
  let bestValue = -Infinity;

  const possibleMoves = getAllPossibleMoves(board, color);
  const depth = getDepthByDifficulty(difficulty);

  for (let move of possibleMoves) {
    const newBoard = makeMove(board, move);
    let moveValue = minimax(newBoard, depth, false, color);

    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }
  return bestMove;
}

function getAllPossibleMoves(board, color) {
  let moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      let piece = board[row][col];
      if (piece && piece.endsWith(`_${color}`)) {
        let [type] = piece.split("_");
        let possibleMoves = getPossibleMovesForPiece(
          { type, color },
          [row, col],
          board
        );
        for (let move of possibleMoves) {
          moves.push({ from: [row, col], to: move });
        }
      }
    }
  }
  return moves;
}

function makeMove(board, move) {
  const newBoard = board.map((r) => [...r]);
  newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
  newBoard[move.from[0]][move.from[1]] = "";
  return newBoard;
}

function minimax(board, depth, isMaximizing, color) {
  if (depth === 0) return evaluateBoard(board, color);

  let bestValue = isMaximizing ? -Infinity : Infinity;
  const opponentColor = color === "w" ? "b" : "w";
  const possibleMoves = getAllPossibleMoves(board, isMaximizing ? color : opponentColor);

  for (let move of possibleMoves) {
    const newBoard = makeMove(board, move);
    const value = minimax(newBoard, depth - 1, !isMaximizing, color);
    bestValue = isMaximizing
      ? Math.max(bestValue, value)
      : Math.min(bestValue, value);
  }
  return bestValue;
}

function evaluateBoard(board, color) {
  let score = 0;
  for (let row of board) {
    for (let piece of row) {
      if (piece) {
        const [type, pieceColor] = piece.split("_");
        const pieceValue = pieceValues[type] || 0;
        score += pieceColor === color ? pieceValue : -pieceValue;
      }
    }
  }
  return score;
}

function getDepthByDifficulty(difficulty) {
  switch (difficulty) {
    case "easy":
      return 1;
    case "medium":
      return 3;
    case "hard":
      return 5;
    default:
      return 3;
  }
}
