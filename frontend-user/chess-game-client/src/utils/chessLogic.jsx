export function isPromotionMove(piece, fromRow, toRow, color) {
    return piece.startsWith("pawn") && ((color === "w" && toRow === 0) || (color === "b" && toRow === 7));
}

export function promotePawn(row, col, board, color, newPieceType) {
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = `${newPieceType}_${color}`;
    return newBoard;
}

export function getPossibleMovesForPiece(piece, position, board, castlingRights = {}, lastMove = null, skipCheck = false) {
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

const getKingMoves = (row, col, board, castlingRights) => {
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

    const color = board[row][col].endsWith("_w") ? "w" : "b";
    if (castlingRights[color] && !castlingRights[color].kingMoved) {
        if (!castlingRights[color].rightRookMoved && !board[row][5] && !board[row][6]) {
            if (!isKingInCheck(board, color) && 
                !isKingInCheck(simulateMove(board, [row, col], [row, 5]), color) && 
                !isKingInCheck(simulateMove(board, [row, col], [row, 6]), color)) {
                moves.push([row, 6]);
            }
        }
        if (!castlingRights[color].leftRookMoved && !board[row][3] && !board[row][2] && !board[row][1]) {
            if (!isKingInCheck(board, color) && 
                !isKingInCheck(simulateMove(board, [row, col], [row, 3]), color) && 
                !isKingInCheck(simulateMove(board, [row, col], [row, 2]), color)) {
                moves.push([row, 2]);
            }
        }
    }

    return moves;
};

export function isKingInCheck(board, color) {
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

function simulateMove(board, from, to) {
    const newBoard = board.map(row => [...row]);
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;
    return newBoard;
}

export { getStraightLineMoves, getDiagonalMoves, getKnightMoves, getKingMoves };