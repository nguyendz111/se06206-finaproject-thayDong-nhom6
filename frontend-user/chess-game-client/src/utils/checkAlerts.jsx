import { getPossibleMovesForPiece } from "./chessLogic";

export function isKingInCheck(board, color) {
    let kingPos = null;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === `king_${color}`) {
                kingPos = [r, c];
                break;
            }
        }
    }
    if (!kingPos) return false;

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

export function isCheckmateOrStalemate(board, color) {
    const isCheck = isKingInCheck(board, color);

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c]?.endsWith(`_${color}`)) {
                const piece = { type: board[r][c].split("_")[0], color };
                const moves = getPossibleMovesForPiece(piece, [r, c], board, {}, null, false);
                if (moves.length > 0) {
                    return { isCheckmate: false, isStalemate: false };
                }
            }
        }
    }

    return isCheck ? { isCheckmate: true, isStalemate: false } : { isCheckmate: false, isStalemate: true };
}
