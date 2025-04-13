import React, { useState, useEffect, useRef } from "react";
import "./board.css";
// eslint-disable-next-line no-unused-vars
import pieceImages from "../images/pieceImages";

// Define piece values for evaluation (used in AI scoring)
const pieceValues = {
  pawn: 1,      // Value of a pawn
  knight: 3,    // Value of a knight
  bishop: 3.5,  // Value of a bishop
  rook: 5,      // Value of a rook
  queen: 9,     // Value of a queen
  king: 1000,   // Value of a king (extremely high to prioritize its safety)
};

// Positional values for pawns (used to encourage pawn advancement)
const positionValues = {
  pawn: [
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 0: Higher values in the center
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 1
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 2
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 3
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 4
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 5
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 6
    [0, 5, 10, 15, 15, 10, 5, 0], // Row 7
  ],
};

// Transposition table to cache board evaluations (optimization for minimax)
const transpositionTable = new Map();

// Initial chessboard setup (8x8 grid)
const initialBoard = [
  ["rook_b", "knight_b", "bishop_b", "queen_b", "king_b", "bishop_b", "knight_b", "rook_b"], // Black pieces (row 0)
  ["pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b", "pawn_b"],         // Black pawns (row 1)
  ["", "", "", "", "", "", "", ""], // Empty rows (2-5)
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w", "pawn_w"],         // White pawns (row 6)
  ["rook_w", "knight_w", "bishop_w", "queen_w", "king_w", "bishop_w", "knight_w", "rook_w"], // White pieces (row 7)
];

// Initial castling rights for both players (white and black)
const initialCastlingRights = {
  w: { kingMoved: false, leftRookMoved: false, rightRookMoved: false }, // White castling rights
  b: { kingMoved: false, leftRookMoved: false, rightRookMoved: false }, // Black castling rights
};

// Check if a pawn move is a promotion (pawn reaching the opponent's back rank)
function isPromotionMove(piece, fromRow, toRow, color) {
  return piece.startsWith("pawn") && ((color === "w" && toRow === 0) || (color === "b" && toRow === 7));
}

// Promote a pawn to a new piece type (e.g., queen, rook, bishop, knight)
function promotePawn(row, col, board, color, newPieceType) {
  const newBoard = board.map(r => [...r]); // Create a copy of the board
  newBoard[row][col] = `${newPieceType}_${color}`; // Replace pawn with the new piece
  return newBoard;
}

// Get all possible moves for a specific piece at a given position
function getPossibleMovesForPiece(piece, position, board, castlingRights = {}, lastMove = null, skipCheck = false) {
  const [row, col] = position; // Extract row and column from position
  const { type, color } = piece; // Extract piece type and color
  let moves = []; // Array to store possible moves

  // Determine moves based on piece type
  if (type === "pawn") moves = getPawnMoves(row, col, color, board, lastMove);
  if (type === "rook") moves = getStraightLineMoves(row, col, board);
  if (type === "bishop") moves = getDiagonalMoves(row, col, board);
  if (type === "queen") moves = [...getStraightLineMoves(row, col, board), ...getDiagonalMoves(row, col, board)];
  if (type === "knight") moves = getKnightMoves(row, col, board);
  if (type === "king") moves = getKingMoves(row, col, board, castlingRights);

  // Filter out moves that would leave the king in check (unless skipCheck is true)
  if (!skipCheck) {
    return moves.filter(move => {
      const newBoard = simulateMove(board, position, move); // Simulate the move
      return !isKingInCheck(newBoard, color); // Ensure the king is not in check
    });
  }
  return moves;
}

// Get possible moves for a pawn (including forward moves, captures, and en passant)
const getPawnMoves = (row, col, color, board, lastMove) => {
  let moves = [];
  const direction = color === "w" ? -1 : 1; // White moves up (-1), black moves down (+1)
  const startRow = color === "w" ? 6 : 1; // Starting row for pawns (white: row 6, black: row 1)

  // Forward move (one square)
  if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
    moves.push([row + direction, col]);
    // Double move from starting position (if the path is clear)
    if (row === startRow && row + 2 * direction >= 0 && row + 2 * direction < 8 && !board[row + 2 * direction][col]) {
      moves.push([row + 2 * direction, col]);
    }
  }

  // Capture diagonally (left)
  if (col > 0 && row + direction >= 0 && row + direction < 8 && board[row + direction][col - 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
    moves.push([row + direction, col - 1]);
  }
  // Capture diagonally (right)
  if (col < 7 && row + direction >= 0 && row + direction < 8 && board[row + direction][col + 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
    moves.push([row + direction, col + 1]);
  }

  // En passant capture
  const enPassantRow = color === "w" ? 3 : 4; // En passant row (white: row 3, black: row 4)
  if (row === enPassantRow && lastMove && lastMove.piece === `pawn_${color === "w" ? "b" : "w"}` && 
      lastMove.from && lastMove.to && Math.abs(lastMove.from[0] - lastMove.to[0]) === 2) {
    const [lastToRow, lastToCol] = lastMove.to;
    if (lastToRow === row && Math.abs(lastToCol - col) === 1) {
      moves.push([row + direction, lastToCol]); // Add en passant move
    }
  }

  return moves;
};

// Get possible moves for a rook (horizontal and vertical)
const getStraightLineMoves = (row, col, board) => {
  let moves = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // Down, up, right, left
  
  for (const [dr, dc] of directions) {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) { // Continue until out of bounds
      if (!board[r][c]) {
        moves.push([r, c]); // Empty square, can move here
      } else {
        if (board[r][c].endsWith("_w") !== board[row][col].endsWith("_w")) {
          moves.push([r, c]); // Enemy piece, can capture
        }
        break; // Stop at any piece (friend or foe)
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
  const directions = [[1, 1], [-1, -1], [1, -1], [-1, 1]]; // Four diagonal directions

  for (const [dr, dc] of directions) {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (!board[r][c]) {
        moves.push([r, c]); // Empty square
      } else {
        if (board[r][c].endsWith("_w") !== board[row][col].endsWith("_w")) {
          moves.push([r, c]); // Enemy piece, can capture
        }
        break; // Stop at any piece
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
  ]; // All possible knight moves

  for (const [dr, dc] of deltas) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
      moves.push([r, c]); // Add move if within bounds and square is empty or has an enemy piece
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
  ]; // All adjacent squares

  // Check adjacent squares
  for (const [dr, dc] of deltas) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
      moves.push([r, c]); // Add move if within bounds and square is empty or has an enemy piece
    }
  }

  // Check castling moves
  const color = board[row][col].endsWith("_w") ? "w" : "b";
  if (castlingRights[color] && !castlingRights[color].kingMoved) {
    // Kingside castling
    if (!castlingRights[color].rightRookMoved && !board[row][5] && !board[row][6]) {
      if (!isKingInCheck(board, color) && 
          !isKingInCheck(simulateMove(board, [row, col], [row, 5]), color) && 
          !isKingInCheck(simulateMove(board, [row, col], [row, 6]), color)) {
        moves.push([row, 6]); // Add kingside castling move
      }
    }
    // Queenside castling
    if (!castlingRights[color].leftRookMoved && !board[row][3] && !board[row][2] && !board[row][1]) {
      if (!isKingInCheck(board, color) && 
          !isKingInCheck(simulateMove(board, [row, col], [row, 3]), color) && 
          !isKingInCheck(simulateMove(board, [row, col], [row, 2]), color)) {
        moves.push([row, 2]); // Add queenside castling move
      }
    }
  }

  return moves;
};

// Check if the king of a given color is in check
function isKingInCheck(board, color) {
  let kingPos;
  // Find the king's position
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === `king_${color}`) {
        kingPos = [r, c];
        break;
      }
    }
  }

  const opponentColor = color === "w" ? "b" : "w"; // Opponent's color
  // Check if any opponent piece can attack the king
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.endsWith(`_${opponentColor}`)) {
        const piece = { type: board[r][c].split("_")[0], color: opponentColor };
        const moves = getPossibleMovesForPiece(piece, [r, c], board, {}, null, true);
        if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) {
          return true; // King is in check
        }
      }
    }
  }
  return false; // King is not in check
}

// Simulate a move on a copy of the board (for checking legality)
function simulateMove(board, from, to) {
  const newBoard = board.map(row => [...row]); // Create a copy of the board
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol]; // Move the piece
  newBoard[fromRow][fromCol] = null; // Clear the original position
  return newBoard;
}

// AI: Find the best move for a given color using minimax
function getBestMove(board, color, difficulty = "medium") {
  let bestMove = null;
  let bestValue = -Infinity;

  const possibleMoves = getAllPossibleMoves(board, color); // Get all possible moves
  const depth = getDepthByDifficulty(difficulty, board); // Determine search depth based on difficulty

  // Evaluate each move using minimax
  for (let move of possibleMoves) {
    const newBoard = makeMove(board, move); // Make the move
    const moveValue = minimax(newBoard, depth, false, color, -Infinity, Infinity); // Evaluate the move
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move; // Update the best move if this move is better
    }
  }
  return bestMove;
}

// Get all possible moves for a given color (used by AI)
function getAllPossibleMoves(board, color) {
  const moves = [];
  // Iterate over the entire board
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.endsWith(`_${color}`)) { // Check if the piece belongs to the player
        const [type] = piece.split("_");
        const possibleMoves = getPossibleMovesForPiece(
          { type, color },
          [row, col],
          board
        );
        // Add each move with additional metadata (capture value for move ordering)
        for (let move of possibleMoves) {
          const isCapture = board[move[0]][move[1]] !== "";
          const captureValue = isCapture ? pieceValues[board[move[0]][move[1]].split("_")[0]] : 0;
          moves.push({ from: [row, col], to: move, isCapture, captureValue });
        }
      }
    }
  }

  // Sort moves by capture value (prioritize captures for better performance in minimax)
  moves.sort((a, b) => b.captureValue - a.captureValue);
  return moves;
}

// Make a move on a copy of the board (used by AI)
function makeMove(board, move) {
  const newBoard = board.map((r) => [...r]); // Create a copy of the board
  newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]]; // Move the piece
  newBoard[move.from[0]][move.from[1]] = ""; // Clear the original position
  return newBoard;
}

// Minimax algorithm with alpha-beta pruning (AI decision-making)
function minimax(board, depth, isMaximizing, color, alpha, beta) {
  const boardHash = JSON.stringify(board); // Hash the board for transposition table
  if (transpositionTable.has(boardHash)) {
    return transpositionTable.get(boardHash); // Return cached result if available
  }

  if (depth === 0) return evaluateBoard(board, color); // Base case: evaluate the board

  const opponentColor = color === "w" ? "b" : "w";
  const possibleMoves = getAllPossibleMoves(board, isMaximizing ? color : opponentColor);

  if (possibleMoves.length === 0) return evaluateBoard(board, color); // No moves available

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of possibleMoves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, false, color, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    transpositionTable.set(boardHash, maxEval); // Cache the result
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of possibleMoves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, true, color, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    transpositionTable.set(boardHash, minEval); // Cache the result
    return minEval;
  }
}

// Evaluate the board state (used by AI to score positions)
function evaluateBoard(board, color) {
  let score = 0;
  // Iterate over the board to calculate the score
  for (let row = 0; row < 8; row++) { // Fixed: Changed `r` to `row` to resolve no-undef error
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const [type, pieceColor] = piece.split("_");
        const pieceValue = pieceValues[type] || 0; // Get the piece's base value
        let positionalValue = positionValues[type] ? positionValues[type][row][col] : 0; // Get positional bonus
        score += (pieceValue + positionalValue) * (pieceColor === color ? 1 : -1); // Add or subtract based on color
      }
    }
  }
  return score;
}

// Determine the search depth for minimax based on difficulty and piece count
function getDepthByDifficulty(difficulty, board) {
  const pieceCount = board.flat().filter((piece) => piece !== "").length; // Count remaining pieces

  if (difficulty === "easy") return 2;
  if (difficulty === "medium") return pieceCount > 20 ? 3 : 4;
  if (difficulty === "hard") {
    if (pieceCount > 24) return 4;
    if (pieceCount > 16) return 5;
    return 6;
  }
  return 3; // Default depth
}

// Square component to render individual squares on the board
const Square = ({ row, col, piece, isBlack, isHighlighted, isKingInCheck, onClick }) => {
  const [isHovered, setIsHovered] = useState(false); // Track hover state for styling

  // Style for the square (color changes based on hover, highlight, and check)
  const squareStyle = {
    width: "60px",
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isKingInCheck
      ? "rgba(255, 0, 0, 0.7)" // Red if king is in check
      : isHighlighted
      ? "yellow" // Yellow if the limited
      : isBlack
      ? isHovered
        ? "#8ba769" // Darker green on hover
        : "#769656" // Default dark square color
      : isHovered
      ? "#f0f0f0" // Light gray on hover
      : "#fff", // Default light square color
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
      onClick={() => onClick(row, col)} // Handle click events
      onMouseEnter={() => setIsHovered(true)} // Handle hover start
      onMouseLeave={() => setIsHovered(false)} // Handle hover end
    >
      {piece && <img src={pieceImages[piece]} alt={piece} style={pieceStyle} />} {/* Render piece image if present */}
    </div>
  );
};

// Main ChessAI component
const ChessAI = () => {
  // State variables for the game
  const [board, setBoard] = useState(initialBoard); // Current board state - Trạng thái bàn cờ hiện tại
  const [selectedPiece, setSelectedPiece] = useState(null); // Currently selected piece - Quân cờ được chọn
  const [selectedPosition, setSelectedPosition] = useState(null); // Position of the selected piece - Vị trí của quân cờ được chọn
  const [turn, setTurn] = useState("w"); // Current turn ("w" for white, "b" for black) - Lượt hiện tại (trắng hoặc đen)
  const [possibleMoves, setPossibleMoves] = useState([]); // Possible moves for the selected piece - Các nước đi hợp lệ
  const [winner, setWinner] = useState(null); // Winner of the game (null if no winner yet) - Người thắng (nếu có)
  const [castlingRights, setCastlingRights] = useState(initialCastlingRights); // Castling rights for both players - Quyền nhập thành
  const [lastMove, setLastMove] = useState(null); // Last move made (for en passant) - Nước đi cuối (dùng cho bắt tốt qua đường)
  const [isPromoting, setIsPromoting] = useState(false); // Whether a pawn is being promoted - Đang phong cấp tốt hay không
  const [promotionPosition, setPromotionPosition] = useState(null); // Position of the pawn being promoted - Vị trí của tốt đang phong cấp
  const [kingInCheck, setKingInCheck] = useState(null); // Position of the king in check (if any) - Vị trí vua bị chiếu (nếu có)
  const [difficulty] = useState("medium"); // AI difficulty level - Độ khó của AI

  // Thêm các trạng thái cho đồng hồ thời gian
  const [whiteTotal, setWhiteTotal] = useState(600); // Tổng thời gian của trắng (10 phút, tính bằng giây)
  const [blackTotal, setBlackTotal] = useState(600); // Tổng thời gian của đen (10 phút, tính bằng giây)
  const [whiteMove, setWhiteMove] = useState(120); // Thời gian mỗi nước đi của trắng (2 phút, tính bằng giây)
  const [blackMove, setBlackMove] = useState(120); // Thời gian mỗi nước đi của đen (2 phút, tính bằng giây)

  const timerIntervalRef = useRef(null); // Ref để lưu interval của đồng hồ thời gian

  // Hàm định dạng thời gian từ giây thành MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Logic đếm ngược thời gian cho từng người chơi
  useEffect(() => {
    if (!winner && !isPromoting) { // Chỉ chạy đồng hồ nếu trò chơi chưa kết thúc và không đang phong cấp
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current); // Xóa interval cũ trước khi tạo mới
      }

      timerIntervalRef.current = setInterval(() => {
        if (turn === "w") { // Nếu là lượt của trắng (người chơi)
          setWhiteTotal(prev => (prev > 0 ? prev - 1 : 0)); // Giảm tổng thời gian của trắng
          setWhiteMove(prev => (prev > 0 ? prev - 1 : 0)); // Giảm thời gian mỗi nước đi của trắng

          // Kiểm tra nếu trắng hết thời gian
          if (whiteTotal <= 0 || whiteMove <= 0) {
            setWinner("Black wins!"); // Đen thắng nếu trắng hết thời gian
            clearInterval(timerIntervalRef.current);
          }
        } else { // Nếu là lượt của đen (AI)
          setBlackTotal(prev => (prev > 0 ? prev - 1 : 0)); // Giảm tổng thời gian của đen
          setBlackMove(prev => (prev > 0 ? prev - 1 : 0)); // Giảm thời gian mỗi nước đi của đen

          // Kiểm tra nếu đen hết thời gian
          if (blackTotal <= 0 || blackMove <= 0) {
            setWinner("White wins!"); // Trắng thắng nếu đen hết thời gian
            clearInterval(timerIntervalRef.current);
          }
        }
      }, 1000); // Cập nhật mỗi giây
    }

    // Dọn dẹp interval khi component unmount hoặc dependencies thay đổi
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [turn, winner, isPromoting, whiteTotal, blackTotal, whiteMove, blackMove]); // Dependencies của useEffect

  // Handle square clicks (selecting pieces or making moves)
  const handleSquareClick = (row, col) => {
    if (winner || isPromoting || turn === "b") return; // Ignore clicks if game is over, promoting, or AI's turn - Bỏ qua nếu trò chơi kết thúc, đang phong cấp, hoặc là lượt của AI
    const piece = board[row][col];
    if (selectedPiece) {
      handleMove(row, col); // Make a move if a piece is selected - Thực hiện nước đi nếu đã chọn quân cờ
    } else if (piece && piece.endsWith(`_w`)) { // Select a white piece if none is selected - Chọn quân trắng nếu chưa có quân nào được chọn
      setSelectedPiece(piece);
      setSelectedPosition([row, col]);
      const [type, color] = piece.split("_");
      setPossibleMoves(getPossibleMovesForPiece({ type, color }, [row, col], board, castlingRights, lastMove));
    }
  };

  // Handle making a move
  const handleMove = (row, col) => {
    if (!selectedPiece || !selectedPosition) return; // Ignore if no piece is selected - Bỏ qua nếu không có quân cờ được chọn
    if (possibleMoves.some((move) => move[0] === row && move[1] === col)) { // Check if the move is valid - Kiểm tra nước đi hợp lệ
      const newBoard = board.map((r) => r.slice()); // Create a copy of the board - Tạo bản sao của bàn cờ
      const capturedPiece = newBoard[row][col]; // Piece at the target position (if any) - Quân cờ tại vị trí đích (nếu có)
      const [fromRow, fromCol] = selectedPosition;
      const color = selectedPiece.endsWith("_w") ? "w" : "b";

      // Update castling rights if a king moves - Cập nhật quyền nhập thành nếu vua di chuyển
      if (selectedPiece === `king_${color}`) {
        setCastlingRights((prev) => ({
          ...prev,
          [color]: { ...prev[color], kingMoved: true },
        }));
        // Handle castling moves - Xử lý nước đi nhập thành
        if (Math.abs(col - fromCol) === 2) {
          if (col === 6) { // Kingside castling - Nhập thành bên vua
            newBoard[fromRow][7] = "";
            newBoard[fromRow][5] = `rook_${color}`;
          } else if (col === 2) { // Queenside castling - Nhập thành bên hậu
            newBoard[fromRow][0] = "";
            newBoard[fromRow][3] = `rook_${color}`;
          }
        }
      } else if (selectedPiece === `rook_${color}`) { // Update castling rights if a rook moves - Cập nhật quyền nhập thành nếu xe di chuyển
        setCastlingRights((prev) => ({
          ...prev,
          [color]: {
            ...prev[color],
            ...(fromCol === 0 && { leftRookMoved: true }),
            ...(fromCol === 7 && { rightRookMoved: true }),
          },
        }));
      }

      // Make the move - Thực hiện nước đi
      newBoard[row][col] = selectedPiece;
      newBoard[fromRow][fromCol] = "";

      // Handle en passant capture - Xử lý bắt tốt qua đường
      const enPassantRow = color === "w" ? 3 : 4;
      if (
        selectedPiece.startsWith("pawn") &&
        fromRow === enPassantRow &&
        Math.abs(fromCol - col) === 1 &&
        !capturedPiece
      ) {
        if (lastMove && lastMove.to) {
          newBoard[lastMove.to[0]][lastMove.to[1]] = ""; // Remove the captured pawn - Xóa tốt bị bắt
        }
      }

      // Check for pawn promotion - Kiểm tra phong cấp tốt
      if (isPromotionMove(selectedPiece, fromRow, row, color)) {
        setPromotionPosition([row, col]);
        setIsPromoting(true);
        setBoard(newBoard);
        setLastMove({ from: selectedPosition, to: [row, col], piece: selectedPiece });
      } else {
        // Check if the move captures a king (game over) - Kiểm tra nếu nước đi ăn vua (kết thúc trò chơi)
        if (capturedPiece.includes("king")) {
          setWinner(turn === "w" ? "White wins!" : "Black wins!");
        } else {
          setBoard(newBoard);
          setTurn("b"); // Switch to AI's turn - Chuyển lượt sang AI
          setLastMove({ from: selectedPosition, to: [row, col], piece: selectedPiece });

          // Check if black's king is in check - Kiểm tra nếu vua đen bị chiếu
          if (isKingInCheck(newBoard, "b")) {
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                if (newBoard[r][c] === `king_b`) {
                  setKingInCheck([r, c]);
                  break;
                }
              }
              if (kingInCheck) break;
            }
          } else {
            setKingInCheck(null);
          }

          // Reset thời gian mỗi nước đi của trắng sau khi đi xong
          setWhiteMove(120); // Đặt lại 2 phút cho nước đi tiếp theo của trắng
        }
      }
    }
    // Reset selection - Đặt lại trạng thái chọn quân cờ
    setSelectedPiece(null);
    setSelectedPosition(null);
    setPossibleMoves([]);
  };

  // Handle AI's turn (black)
  useEffect(() => {
    if (turn === "b" && !winner && !isPromoting) { // AI's turn - Lượt của AI
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board, "b", difficulty); // Calculate the best move - Tính nước đi tốt nhất
        if (bestMove) {
          const newBoard = board.map((r) => r.slice());
          const { from, to } = bestMove;
          const piece = newBoard[from[0]][from[1]];
          const capturedPiece = newBoard[to[0]][to[1]];

          const color = "b";
          // Update castling rights for AI's king - Cập nhật quyền nhập thành của vua AI
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
          } else if (piece === `rook_${color}`) { // Update castling rights for AI's rook - Cập nhật quyền nhập thành của xe AI
            setCastlingRights((prev) => ({
              ...prev,
              [color]: {
                ...prev[color],
                ...(from[1] === 0 && { leftRookMoved: true }),
                ...(from[1] === 7 && { rightRookMoved: true }),
              },
            }));
          }

          // Make the move - Thực hiện nước đi
          newBoard[to[0]][to[1]] = piece;
          newBoard[from[0]][from[1]] = "";

          // Handle en passant for AI - Xử lý bắt tốt qua đường cho AI
          if (
            piece.startsWith("pawn") &&
            from[0] === 4 &&
            Math.abs(from[1] - to[1]) === 1 &&
            !capturedPiece
          ) {
            if (lastMove && lastMove.to) {
              newBoard[lastMove.to[0]][lastMove.to[1]] = "";
            }
          }

          // Handle pawn promotion for AI (auto-promote to queen) - Xử lý phong cấp tốt cho AI (tự động thành hậu)
          if (isPromotionMove(piece, from[0], to[0], "b")) {
            newBoard[to[0]][to[1]] = `queen_b`;
            setBoard(newBoard);
            setTurn("w");
            setLastMove({ from, to, piece });

            // Check if white's king is in check - Kiểm tra nếu vua trắng bị chiếu
            if (isKingInCheck(newBoard, "w")) {
              for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                  if (newBoard[r][c] === `king_w`) {
                    setKingInCheck([r, c]);
                    break;
                  }
                }
              }
            } else {
              setKingInCheck(null);
            }

            // Reset thời gian mỗi nước đi của đen sau khi AI đi xong
            setBlackMove(120); // Đặt lại 2 phút cho nước đi tiếp theo của đen
          } else {
            // Check if AI captured white's king - Kiểm tra nếu AI ăn vua trắng
            if (capturedPiece.includes("king")) {
              setWinner("Black wins!");
            } else {
              setBoard(newBoard);
              setTurn("w");
              setLastMove({ from, to, piece });

              // Check if white's king is in check - Kiểm tra nếu vua trắng bị chiếu
              if (isKingInCheck(newBoard, "w")) {
                for (let r = 0; r < 8; r++) {
                  for (let c = 0; c < 8; c++) {
                    if (newBoard[r][c] === `king_w`) {
                      setKingInCheck([r, c]);
                      break;
                    }
                  }
                }
              } else {
                setKingInCheck(null);
              }

              // Reset thời gian mỗi nước đi của đen sau khi AI đi xong
              setBlackMove(120); // Đặt lại 2 phút cho nước đi tiếp theo của đen
            }
          }
        }
      }, 500); // Delay AI move by 500ms for better UX - Tạm dừng 500ms để cải thiện trải nghiệm người dùng
      return () => clearTimeout(timer); // Cleanup timer on unmount - Dọn dẹp timer khi component unmount
    }
  }, [turn, board, winner, isPromoting, difficulty, lastMove]); // Dependencies for useEffect - Các dependencies của useEffect

  // Handle pawn promotion (player selects a piece)
  const handlePromotion = (newPieceType) => {
    if (promotionPosition) {
      const [row, col] = promotionPosition;
      const color = turn === "w" ? "w" : "b";
      const updatedBoard = promotePawn(row, col, board, color, newPieceType); // Promote the pawn - Phong cấp tốt
      setBoard(updatedBoard);
      setTurn(turn === "w" ? "b" : "w"); // Switch turns - Chuyển lượt
      setIsPromoting(false);
      setPromotionPosition(null);

      // Check if the opponent's king is in check after promotion - Kiểm tra nếu vua đối phương bị chiếu sau khi phong cấp
      const opponentColor = color === "w" ? "b" : "w";
      if (isKingInCheck(updatedBoard, opponentColor)) {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (updatedBoard[r][c] === `king_${opponentColor}`) {
              setKingInCheck([r, c]);
              break;
            }
          }
        }
      } else {
        setKingInCheck(null);
      }
    }
  };

  // Options for pawn promotion (player can choose queen, rook, bishop, or knight)
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

// Render the chessboard and UI
return (
  <div className="game-container">
    {/* Thêm bảng thông tin bên trái */}
    <div className="info-panel">
      <h2>Chess AI</h2> {/* Tiêu đề của trò chơi */}
      <div className="game-info">
        <div className="turn-info">
          {/* Hiển thị lượt hiện tại */}
          <span>Lượt: {turn === "w" ? "Trắng" : "Đen"}</span>
        </div>
        {/* Hiển thị đồng hồ thời gian */}
        <div className="timers">
          <div className="timer white-timer">
            <div className="timer-label">Trắng:</div> {/* Nhãn cho thời gian của trắng */}
            <div className="timer-time">
              <div className="total-time">{formatTime(whiteTotal)}</div> {/* Tổng thời gian của trắng */}
              <div className="move-time">{formatTime(whiteMove)}</div> {/* Thời gian mỗi nước đi của trắng */}
            </div>
          </div>
          <div className="timer black-timer">
            <div className="timer-label">Đen:</div> {/* Nhãn cho thời gian của đen */}
            <div className="timer-time">
              <div className="total-time">{formatTime(blackTotal)}</div> {/* Tổng thời gian của đen */}
              <div className="move-time">{formatTime(blackMove)}</div> {/* Thời gian mỗi nước đi của đen */}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Phần bàn cờ hiện tại */}
    <div className="board-wrapper">
      <div className="board-content">
        {/* Xóa phần hiển thị lượt đi và trạng thái "Check!" */}
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

    {/* Game over overlay */}
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

    {/* Pawn promotion modal */}
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