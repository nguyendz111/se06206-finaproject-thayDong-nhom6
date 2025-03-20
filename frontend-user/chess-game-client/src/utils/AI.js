import { getPossibleMovesForPiece } from "./chessLogic";

export function getBestMove(board, color) {
    let bestMove = null;
    let bestValue = -Infinity;

    const possibleMoves = getAllPossibleMoves(board, color);

    for (let move of possibleMoves) {
        const newBoard = makeMove(board, move);
        let moveValue = minimax(newBoard, 3, false);

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
                let [type, _] = piece.split("_");
                let possibleMoves = getPossibleMovesForPiece({ type, color }, [row, col], board);
                for (let move of possibleMoves) {
                    moves.push({ from: [row, col], to: move });
                }
            }
        }
    }
    return moves;
}

function makeMove(board, move) {
    const newBoard = board.map(r => r.slice());
    newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
    newBoard[move.from[0]][move.from[1]] = "";
    return newBoard;
}

function minimax(board, depth, isMaximizing) {
    if (depth === 0) return evaluateBoard(board);

    let bestValue = isMaximizing ? -Infinity : Infinity;

    const possibleMoves = getAllPossibleMoves(board, isMaximizing ? "b" : "w");

    for (let move of possibleMoves) {
        const newBoard = makeMove(board, move);
        let value = minimax(newBoard, depth - 1, !isMaximizing);
        bestValue = isMaximizing ? Math.max(bestValue, value) : Math.min(bestValue, value);
    }

    return bestValue;
}

function evaluateBoard(board) {
    return Math.random() * 10;
}
