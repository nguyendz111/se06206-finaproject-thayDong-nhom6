import { getPossibleMovesForPiece } from "./chessLogic";

const pieceValues = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 1000,
};

// Bộ nhớ đệm cho Alpha-Beta Pruning
const transpositionTable = new Map();

export function getBestMove(board, color, difficulty = "medium") {
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

// Lấy tất cả các nước đi hợp lệ
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
          moves.push({ from: [row, col], to: move, isCapture });
        }
      }
    }
  }

  // Move Ordering: Ưu tiên nước bắt quân
  moves.sort((a, b) => (b.isCapture ? 1 : 0) - (a.isCapture ? 1 : 0));

  return moves;
}

function makeMove(board, move) {
  const newBoard = board.map((r) => [...r]);
  newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
  newBoard[move.from[0]][move.from[1]] = "";
  return newBoard;
}

// Alpha-Beta Pruning + Move Ordering
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
      if (beta <= alpha) break; // Cắt tỉa
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
      if (beta <= alpha) break; // Cắt tỉa
    }
    transpositionTable.set(boardHash, minEval);
    return minEval;
  }
}

// Đánh giá bàn cờ
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

// Độ sâu thích ứng dựa trên số quân
function getDepthByDifficulty(difficulty, board) {
  const pieceCount = board.flat().filter((piece) => piece !== "").length;

  if (difficulty === "easy") return 1;

  if (difficulty === "medium") return pieceCount > 20 ? 3 : 4;

  if (difficulty === "hard") {
    if (pieceCount > 24) return 3; // Mở đầu
    if (pieceCount > 16) return 4; // Giữa trận
    return 5; // Cuối trận
  }

  return 3; // Mặc định Medium
}
