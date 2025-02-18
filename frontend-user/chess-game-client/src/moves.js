export function getPossibleMovesForPiece(piece, position, board) {
    const [row, col] = position;
    const { type, color } = piece;
    let moves = [];

    if (type === "pawn") {
        const direction = color === "w" ? -1 : 1; // White moves up, Black moves down
        const startRow = color === "w" ? 6 : 1; // Initial row for pawns

        // Forward move (only if empty)
        if (!board[row + direction][col]) {
            moves.push([row + direction, col]);

            // Double move if at start position
            if (row === startRow && !board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }

        // Capturing diagonally
        if (col > 0 && board[row + direction][col - 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
            moves.push([row + direction, col - 1]);
        }
        if (col < 7 && board[row + direction][col + 1]?.endsWith(`_${color === "w" ? "b" : "w"}`)) {
            moves.push([row + direction, col + 1]);
        }
    }

    if (type === "rook") {
        moves = getStraightLineMoves(row, col, board);
    }

    if (type === "bishop") {
        moves = getDiagonalMoves(row, col, board);
    }

    if (type === "queen") {
        moves = [...getStraightLineMoves(row, col, board), ...getDiagonalMoves(row, col, board)];
    }

    if (type === "knight") {
        moves = getKnightMoves(row, col, board);
    }

    if (type === "king") {
        moves = getKingMoves(row, col, board);
    }

    return moves;
}

// Helper Functions
const getStraightLineMoves = (row, col, board) => {
    let moves = [];
    const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1] // Down, Up, Right, Left
    ];
    for (const [dr, dc] of directions) {
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c]) {
                moves.push([r, c]);
            } else {
                if (board[r][c].endsWith("_w") !== board[row][col].endsWith("_w")) {
                    moves.push([r, c]); // Can capture
                }
                break; // Stop if blocked
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
};

const getDiagonalMoves = (row, col, board) => {
    let moves = [];
    const directions = [
        [1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal directions
    ];
    for (const [dr, dc] of directions) {
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c]) {
                moves.push([r, c]);
            } else {
                if (board[r][c].endsWith("_w") !== board[row][col].endsWith("_w")) {
                    moves.push([r, c]); // Can capture
                }
                break; // Stop if blocked
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
