import React, { useState } from "react";
import "../App.css";
import { getPossibleMovesForPiece, isPromotionMove, promotePawn } from "../utils/chessLogic";
import Square from "./Square";
import { useNavigate } from "react-router-dom";
import "../style/Board.css";
import playerIcon from "../assets/images/hand-chess.png";
import aiIcon from "../assets/images/computer-icon.png";
// Import hình ảnh quân cờ
import queen_w from "../assets/images/queen_w.png";
import rook_w from "../assets/images/rook_w.png";
import bishop_w from "../assets/images/bishop_w.png";
import knight_w from "../assets/images/knight_w.png";
import queen_b from "../assets/images/queen_b.png";
import rook_b from "../assets/images/rook_b.png";
import bishop_b from "../assets/images/bishop_b.png";
import knight_b from "../assets/images/knight_b.png";

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

const initialCastlingRights = {
    w: { kingMoved: false, leftRookMoved: false, rightRookMoved: false },
    b: { kingMoved: false, leftRookMoved: false, rightRookMoved: false }
};

const Board = () => {
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
    const navigate = useNavigate();

    const handleSquareClick = (row, col) => {
        if (winner || isPromoting) return;
        const piece = board[row][col];
        if (selectedPiece) {
            handleMove(row, col);
        } else if (piece && piece.endsWith(`_${turn}`)) {
            setSelectedPiece(piece);
            setSelectedPosition([row, col]);
            const [type, color] = piece.split("_");
            setPossibleMoves(getPossibleMovesForPiece({ type, color }, [row, col], board, castlingRights, lastMove));
        }
    };

    const handleMove = (row, col) => {
        if (!selectedPiece || !selectedPosition) return;
        if (possibleMoves.some(move => move[0] === row && move[1] === col)) {
            const newBoard = board.map(r => r.slice());
            const capturedPiece = newBoard[row][col];
            const [fromRow, fromCol] = selectedPosition;
            const color = selectedPiece.endsWith("_w") ? "w" : "b";

            // Xử lý nhập thành
            if (selectedPiece === `king_${color}`) {
                setCastlingRights(prev => ({
                    ...prev,
                    [color]: { ...prev[color], kingMoved: true }
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
                setCastlingRights(prev => ({
                    ...prev,
                    [color]: {
                        ...prev[color],
                        ...(fromCol === 0 && { leftRookMoved: true }),
                        ...(fromCol === 7 && { rightRookMoved: true })
                    }
                }));
            }

            // Di chuyển quân cờ
            newBoard[row][col] = selectedPiece;
            newBoard[fromRow][fromCol] = "";

            // Xử lý bắt qua đường
            const enPassantRow = color === "w" ? 3 : 4;
            if (selectedPiece.startsWith("pawn") && fromRow === enPassantRow && Math.abs(fromCol - col) === 1 && !capturedPiece) {
                if (lastMove && lastMove.to) {
                    newBoard[lastMove.to[0]][lastMove.to[1]] = "";
                }
            }

            // Kiểm tra phong cấp
            if (isPromotionMove(selectedPiece, fromRow, row, color)) {
                setPromotionPosition([row, col]);
                setIsPromoting(true);
                setBoard(newBoard);
                setLastMove({ from: selectedPosition, to: [row, col], piece: selectedPiece });
            } else {
                if (capturedPiece.includes("king")) {
                    setWinner(turn === "w" ? "White wins!" : "Black wins!");
                } else {
                    setBoard(newBoard);
                    setTurn(turn === "w" ? "b" : "w");
                    setLastMove({ from: selectedPosition, to: [row, col], piece: selectedPiece });
                }
            }
        }
        setSelectedPiece(null);
        setSelectedPosition(null);
        setPossibleMoves([]);
    };

    const handlePromotion = (newPieceType) => {
        if (promotionPosition) {
            const [row, col] = promotionPosition;
            const color = turn === "w" ? "b" : "w"; // Đổi lượt sau khi phong cấp
            const updatedBoard = promotePawn(row, col, board, turn, newPieceType);
            setBoard(updatedBoard);
            setTurn(color);
            setIsPromoting(false);
            setPromotionPosition(null);
        }
    };

    // Danh sách quân cờ để hiển thị trong modal
    const promotionOptions = {
        w: [
            { type: "queen", img: queen_w },
            { type: "rook", img: rook_w },
            { type: "bishop", img: bishop_w },
            { type: "knight", img: knight_w }
        ],
        b: [
            { type: "queen", img: queen_b },
            { type: "rook", img: rook_b },
            { type: "bishop", img: bishop_b },
            { type: "knight", img: knight_b }
        ]
    };

    return (
        <div className="game-container">
            <div className="board-wrapper">
                <div className="board-content">
                    <h2>Play: {turn === "w" ? "White" : "Black"}</h2>
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
                                        isHighlighted={possibleMoves.some(move => move[0] === rowIndex && move[1] === colIndex)}
                                        onClick={handleSquareClick}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

              
            </div>

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

            {isPromoting && (
                <div className="promotion-overlay">
                    <div className="promotion-modal">
                        <h3>Chọn quân để phong cấp</h3>
                        <div className="promotion-options">
                            {promotionOptions[turn].map(option => (
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

export default Board;