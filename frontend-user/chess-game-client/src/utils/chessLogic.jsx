// utils/chessLogic.jsx

export function getPossibleMovesForPiece(piece, position, board) {
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

    return moves;
}

// ♟️ Xử lý nước đi cho từng quân cờ
const getPawnMoves = (row, col, color, board) => {
    let moves = [];
    const direction = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;

    if (!board[row + direction][col]) {
        moves.push([row + direction, col]);
        if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push([row + 2 * direction, col]);
        }
    }

    if (col > 0 && board[row + direction][col - 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
        moves.push([row + direction, col - 1]);
    }
    if (col < 7 && board[row + direction][col + 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
        moves.push([row + direction, col + 1]);
    }

    return moves;
};

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

const getKnightMoves = (row, col, board) => {
    const moves = [];
    const deltas = [
        [-2, -1], [-2, 1], [2, -1], [2, 1],
        [-1, -2], [-1, 2], [1, -2], [1, 2]
    ];

    for (const [dr, dc] of deltas) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
            moves.push([r, c]);
        }
    }
    return moves;
};

const getKingMoves = (row, col, board) => {
    const moves = [];
    const deltas = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of deltas) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c].endsWith("_w") !== board[row][col].endsWith("_w"))) {
            moves.push([r, c]);
        }
    }
    return moves;
};

// Xuất các hàm để sử dụng ở component khác
export { getStraightLineMoves, getDiagonalMoves, getKnightMoves, getKingMoves };
 