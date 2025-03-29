export function getPossibleMovesForPiece(piece, position, board) {
    if (!piece) return [];

    const [row, col] = position;
    const { type, color } = piece;
    let moves = [];

    if (type === "pawn") {
        moves = getPawnMoves(row, col, color, board);
    }

    if (type === "rook") {
        moves = getStraightLineMoves(row, col, board);
    }

    if (type === "bishop") {
        moves = getDiagonalMoves(row, col, board);
    }

    if (type === "queen") {
        moves = [
            ...getStraightLineMoves(row, col, board),
            ...getDiagonalMoves(row, col, board),
        ];
    }

    if (type === "knight") {
        moves = getKnightMoves(row, col, board);
    }

    if (type === "king") {
        moves = getKingMoves(row, col, board);
    }

    return moves.filter(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8); // ✅ Đảm bảo nước đi hợp lệ
}

// ♟️ Xử lý nước đi của Tốt (Pawn)
const getPawnMoves = (row, col, color, board) => {
    let moves = [];
    const direction = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;

    if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
        moves.push([row + direction, col]);
        
        if (row === startRow && row + 2 * direction >= 0 && row + 2 * direction < 8 && !board[row + 2 * direction][col]) {
            moves.push([row + 2 * direction, col]);
        }
    }

    for (const dc of [-1, 1]) {
        const newCol = col + dc;
        if (newCol >= 0 && newCol < 8 && row + direction >= 0 && row + direction < 8) {
            if (board[row + direction][newCol]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
                moves.push([row + direction, newCol]);
            }
        }
    }

    return moves;
};

// ♜ Xử lý nước đi Xe (Rook)
const getStraightLineMoves = (row, col, board) => {
    let moves = [];
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (const [dr, dc] of directions) {
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r] || !board[r][c]) {
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

// ♝ Xử lý nước đi Tượng (Bishop)
const getDiagonalMoves = (row, col, board) => {
    let moves = [];
    const directions = [[1, 1], [-1, -1], [1, -1], [-1, 1]];

    for (const [dr, dc] of directions) {
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r] || !board[r][c]) {
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

// ♞ Xử lý nước đi Mã (Knight)
const getKnightMoves = (row, col, board) => {
    const moves = [];
    const deltas = [
        [-2, -1], [-2, 1], [2, -1], [2, 1],
        [-1, -2], [-1, 2], [1, -2], [1, 2]
    ];

    for (const [dr, dc] of deltas) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r] || !board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
            moves.push([r, c]);
        }
    }
    return moves;
};

// ♚ Xử lý nước đi Vua (King)
const getKingMoves = (row, col, board) => {
    const moves = [];
    const deltas = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of deltas) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r] || !board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
            moves.push([r, c]);
        }
    }
    return moves;
};

// ✅ Đảm bảo nước đi không ra ngoài biên bàn cờ
function isValidMove(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// ✅ Cập nhật `makeMove` để tránh lỗi
function makeMove(board, move) {
    const newBoard = board.map((r) => [...r]);
    if (!move || !move.from || !move.to) return newBoard; // Kiểm tra move hợp lệ

    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;
    if (!isValidMove(fromRow, fromCol) || !isValidMove(toRow, toCol)) return newBoard; // Kiểm tra tọa độ hợp lệ

    const piece = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = "";

    if (move.promote) {
        newBoard[toRow][toCol] = `queen_${piece.split("_")[1]}`;
    } else {
        newBoard[toRow][toCol] = piece;
    }

    return newBoard;
}

export { getStraightLineMoves, getDiagonalMoves, getKnightMoves, getKingMoves, makeMove };
