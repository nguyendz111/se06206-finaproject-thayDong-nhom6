import React, { useState } from 'react';
import './App.css';
import rook_b from './assets/image/rook_b.png';
import knight_b from './assets/image/knight_b.png';
import bishop_b from './assets/image/bishop_b.png';
import queen_b from './assets/image/queen_b.png';
import king_b from './assets/image/king_b.png';
import pawn_b from './assets/image/pawn_b.png';
import rook_w from './assets/image/rook_w.png';
import knight_w from './assets/image/knight_w.png';
import bishop_w from './assets/image/bishop_w.png';
import queen_w from './assets/image/queen_w.png';
import king_w from './assets/image/king_w.png';
import pawn_w from './assets/image/pawn_w.png';
import { getPossibleMovesForPiece } from './moves';

const pieceImages = {
  rook_b, knight_b, bishop_b, queen_b, king_b, pawn_b,
  rook_w, knight_w, bishop_w, queen_w, king_w, pawn_w,
};

const initialBoard = [
  ['rook_b', 'knight_b', 'bishop_b', 'queen_b', 'king_b', 'bishop_b', 'knight_b', 'rook_b'],
  ['pawn_b', 'pawn_b', 'pawn_b', 'pawn_b', 'pawn_b', 'pawn_b', 'pawn_b', 'pawn_b'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['pawn_w', 'pawn_w', 'pawn_w', 'pawn_w', 'pawn_w', 'pawn_w', 'pawn_w', 'pawn_w'],
  ['rook_w', 'knight_w', 'bishop_w', 'queen_w', 'king_w', 'bishop_w', 'knight_w', 'rook_w'],
];

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [turn, setTurn] = useState('w');
  const [possibleMoves, setPossibleMoves] = useState([]);

  const handleSquareClick = (row, col) => {
    const piece = board[row][col];

    if (selectedPiece) {
      handleMove(row, col);
    } else if (piece && piece.endsWith(`_${turn}`)) {
      setSelectedPiece(piece);
      setSelectedPosition([row, col]);
      const [type, color] = piece.split("_");
      const moves = getPossibleMovesForPiece({ type, color }, [row, col], board);
      setPossibleMoves(moves);
    }
  };

  const handleMove = (row, col) => {
    if (!selectedPiece || !selectedPosition) return;

    if (possibleMoves.some(move => move[0] === row && move[1] === col)) {
      const newBoard = board.map((r) => r.slice());
      newBoard[row][col] = selectedPiece;
      newBoard[selectedPosition[0]][selectedPosition[1]] = '';

      setBoard(newBoard);
      setTurn(turn === 'w' ? 'b' : 'w');
    }

    setSelectedPiece(null);
    setSelectedPosition(null);
    setPossibleMoves([]);
  };

  const renderSquare = (row, col) => {
    const isBlack = (row + col) % 2 === 1;
    const piece = board[row][col];
    const isHighlighted = possibleMoves.some(move => move[0] === row && move[1] === col);

    return (
      <div
        key={`${row}-${col}`}
        className={`square ${isBlack ? 'black-square' : 'white-square'} ${isHighlighted ? 'highlight' : ''}`}
        onClick={() => handleSquareClick(row, col)}
      >
        {piece && (
          <img
            src={pieceImages[piece]}
            alt={piece}
            className="chess-piece"
          />
        )}
      </div>
    );
  };

  const renderBoard = () => board.map((row, rowIndex) => (
    <div key={rowIndex} className="row">
      {row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}
    </div>
  ));

  return (
    <div className="App">
      <h1 className="title">React Chess Game</h1>
      <h2>Lượt chơi: {turn === 'w' ? 'Trắng' : 'Đen'}</h2>
      <div className="board-container">{renderBoard()}</div>
    </div>
  );
}

export default App;
