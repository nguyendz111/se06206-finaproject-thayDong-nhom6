// chess-puzzle.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChessPuzzle.css';

const BOARD_SIZE = 8;

const ChessPuzzle = () => {
  // States
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [board, setBoard] = useState([]);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [isEditing, setIsEditing] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [puzzleName, setPuzzleName] = useState('');
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch puzzles from the server
  useEffect(() => {
    fetchPuzzles();
  }, []);

  const fetchPuzzles = async () => {
    try {
      const response = await axios.get('http://150.95.115.213:3001/puzzles');
      setPuzzles(response.data);
    } catch (error) {
      console.error('Error fetching puzzles:', error);
      setMessage('Failed to fetch puzzles from server');
    }
  };

  // Select a puzzle to play or edit
  const selectPuzzle = async (id) => {
    try {
      const response = await axios.get(`http://150.95.115.213:3001/puzzles/${id}`);
      const puzzle = response.data;
      
      setCurrentPuzzle(puzzle);
      setBoard(JSON.parse(puzzle.board_state));
      setCurrentTurn(puzzle.current_turn);
      setPuzzleName(puzzle.name);
      setDifficulty(puzzle.difficulty_rating);
      setSelected(null);
      setValidMoves([]);
      setMessage('');
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      setMessage('Failed to load the selected puzzle');
    }
  };

  // Create a new empty puzzle
  const createNewPuzzle = () => {
    const initialBoard = [
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      ["R", "N", "B", "Q", "K", "B", "N", "R"]
    ];
    
    setCurrentPuzzle({ id: 'new' });
    setBoard(initialBoard);
    setCurrentTurn('white');
    setPuzzleName('New Puzzle');
    setDifficulty(1);
    setSelected(null);
    setValidMoves([]);
    setIsEditing(true);
    setIsCreating(true);
    setMessage('Creating a new puzzle. Set up the board and save when ready.');
  };

  // Save current puzzle state
  const savePuzzle = async () => {
    if (!puzzleName.trim()) {
      setMessage('Please provide a puzzle name');
      return;
    }

    try {
      const puzzleData = {
        name: puzzleName,
        board_state: JSON.stringify(board),
        current_turn: currentTurn,
        difficulty_rating: difficulty
      };

      if (isCreating) {
        await axios.post('http://150.95.115.213:3001/puzzles', puzzleData);
        setMessage('New puzzle created successfully!');
      } else {
        await axios.put(`http://150.95.115.213:3001/puzzles/${currentPuzzle.id}`, puzzleData);
        setMessage('Puzzle updated successfully!');
      }

      setIsEditing(false);
      setIsCreating(false);
      fetchPuzzles();
    } catch (error) {
      console.error('Error saving puzzle:', error);
      setMessage('Failed to save puzzle');
    }
  };

  // Delete the current puzzle
  const deletePuzzle = async () => {
    if (!currentPuzzle || currentPuzzle.id === 'new') return;

    if (window.confirm('Are you sure you want to delete this puzzle?')) {
      try {
        await axios.delete(`http://150.95.115.213:3001/puzzles/${currentPuzzle.id}`);
        setMessage('Puzzle deleted successfully!');
        setCurrentPuzzle(null);
        setBoard([]);
        fetchPuzzles();
      } catch (error) {
        console.error('Error deleting puzzle:', error);
        setMessage('Failed to delete puzzle');
      }
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      setIsEditing(false);
      // If we're canceling a new puzzle creation, reset the board
      if (isCreating) {
        setCurrentPuzzle(null);
        setBoard([]);
        setIsCreating(false);
      } else if (currentPuzzle) {
        // Restore the original puzzle state if we're canceling edits
        setBoard(JSON.parse(currentPuzzle.board_state));
        setCurrentTurn(currentPuzzle.current_turn);
      }
    } else {
      setIsEditing(true);
    }
    setSelected(null);
    setValidMoves([]);
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    const piece = board[row][col];
    
    if (isEditing) {
      // In edit mode, toggle selection for piece placement
      if (selected) {
        // If a cell is already selected, we're placing a piece
        const newBoard = board.map(r => [...r]);
        
        if (selected === 'delete') {
          // Delete the piece
          newBoard[row][col] = null;
        } else {
          // Place the selected piece
          newBoard[row][col] = selected;
        }
        
        setBoard(newBoard);
      } else if (piece) {
        // Select a piece to move
        setSelected([row, col]);
      }
    } else {
      // In play mode, move pieces
      if (selected) {
        const [selectedRow, selectedCol] = selected;
        
        // Check if the move is valid
        const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
        
        if (isValidMove) {
          // Make the move
          const newBoard = board.map(r => [...r]);
          newBoard[row][col] = newBoard[selectedRow][selectedCol];
          newBoard[selectedRow][selectedCol] = null;
          
          setBoard(newBoard);
          setCurrentTurn(currentTurn === 'white' ? 'black' : 'white');
          setSelected(null);
          setValidMoves([]);
        } else if (piece && (piece === piece.toUpperCase() ? 'white' : 'black') === currentTurn) {
          // Select another piece
          setSelected([row, col]);
          setValidMoves(getValidMoves(row, col));
        } else {
          // Deselect
          setSelected(null);
          setValidMoves([]);
        }
      } else if (piece && (piece === piece.toUpperCase() ? 'white' : 'black') === currentTurn) {
        // Select a piece
        setSelected([row, col]);
        setValidMoves(getValidMoves(row, col));
      }
    }
  };

  // Get valid moves for a selected piece
  const getValidMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece) return [];
    
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    if (pieceColor !== currentTurn) return [];
    
    const moves = [];
    const pieceType = piece.toLowerCase();
    
    // Check valid moves based on piece type
    switch (pieceType) {
      case 'p': // Pawn
        getPawnMoves(row, col, pieceColor, moves);
        break;
      case 'r': // Rook
        getRookMoves(row, col, pieceColor, moves);
        break;
      case 'n': // Knight
        getKnightMoves(row, col, pieceColor, moves);
        break;
      case 'b': // Bishop
        getBishopMoves(row, col, pieceColor, moves);
        break;
      case 'q': // Queen
        getQueenMoves(row, col, pieceColor, moves);
        break;
      case 'k': // King
        getKingMoves(row, col, pieceColor, moves);
        break;
      default:
        break;
    }
    
    return filterMovesForCheck(row, col, moves, pieceColor);
  };

  // Filter moves that would result in check
  const filterMovesForCheck = (startRow, startCol, moves, pieceColor) => {
    return moves.filter(([endRow, endCol]) => {
      // Create a copy of the board
      const tempBoard = board.map(row => [...row]);
      
      // Simulate the move
      const movingPiece = tempBoard[startRow][startCol];
      tempBoard[endRow][endCol] = movingPiece;
      tempBoard[startRow][startCol] = null;
      
      // Check if the king would be in check after the move
      const kingPosition = findKingPosition(tempBoard, pieceColor);
      if (!kingPosition) return true; // Allow the move if king not found
      
      return !isKingInCheck(tempBoard, kingPosition[0], kingPosition[1], pieceColor);
    });
  };

  // Find the position of the king
  const findKingPosition = (boardState, color) => {
    const kingSymbol = color === 'white' ? 'K' : 'k';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState[row][col] === kingSymbol) {
          return [row, col];
        }
      }
    }
    
    return null;
  };

  // Check if the king is in check
  const isKingInCheck = (boardState, kingRow, kingCol, kingColor) => {
    const opponentColor = kingColor === 'white' ? 'black' : 'white';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = boardState[row][col];
        if (!piece) continue;
        
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        if (pieceColor !== opponentColor) continue;
        
        const pieceType = piece.toLowerCase();
        let canAttackKing = false;
        
        switch (pieceType) {
          case 'p': // Pawn
            canAttackKing = canPawnAttack(row, col, kingRow, kingCol, pieceColor);
            break;
          case 'r': // Rook
            canAttackKing = canRookAttack(row, col, kingRow, kingCol, boardState);
            break;
          case 'n': // Knight
            canAttackKing = canKnightAttack(row, col, kingRow, kingCol);
            break;
          case 'b': // Bishop
            canAttackKing = canBishopAttack(row, col, kingRow, kingCol, boardState);
            break;
          case 'q': // Queen
            canAttackKing = canQueenAttack(row, col, kingRow, kingCol, boardState);
            break;
          case 'k': // King
            canAttackKing = canKingAttack(row, col, kingRow, kingCol);
            break;
          default:
            break;
        }
        
        if (canAttackKing) return true;
      }
    }
    
    return false;
  };

  // Check if a pawn can attack the given square
  const canPawnAttack = (pawnRow, pawnCol, targetRow, targetCol, pawnColor) => {
    const direction = pawnColor === 'white' ? -1 : 1;
    return pawnRow + direction === targetRow && (pawnCol + 1 === targetCol || pawnCol - 1 === targetCol);
  };

  // Check if a rook can attack the given square
  const canRookAttack = (rookRow, rookCol, targetRow, targetCol, boardState) => {
    // Check horizontally
    if (rookRow === targetRow) {
      const start = Math.min(rookCol, targetCol);
      const end = Math.max(rookCol, targetCol);
      
      for (let col = start + 1; col < end; col++) {
        if (boardState[rookRow][col] !== null) return false;
      }
      return true;
    }
    
    // Check vertically
    if (rookCol === targetCol) {
      const start = Math.min(rookRow, targetRow);
      const end = Math.max(rookRow, targetRow);
      
      for (let row = start + 1; row < end; row++) {
        if (boardState[row][rookCol] !== null) return false;
      }
      return true;
    }
    
    return false;
  };

  // Check if a knight can attack the given square
  const canKnightAttack = (knightRow, knightCol, targetRow, targetCol) => {
    const rowDiff = Math.abs(knightRow - targetRow);
    const colDiff = Math.abs(knightCol - targetCol);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  // Check if a bishop can attack the given square
  const canBishopAttack = (bishopRow, bishopCol, targetRow, targetCol, boardState) => {
    const rowDiff = Math.abs(bishopRow - targetRow);
    const colDiff = Math.abs(bishopCol - targetCol);
    
    // Check diagonal
    if (rowDiff === colDiff) {
      const rowDirection = targetRow > bishopRow ? 1 : -1;
      const colDirection = targetCol > bishopCol ? 1 : -1;
      
      let row = bishopRow + rowDirection;
      let col = bishopCol + colDirection;
      
      while (row !== targetRow && col !== targetCol) {
        if (boardState[row][col] !== null) return false;
        row += rowDirection;
        col += colDirection;
      }
      
      return true;
    }
    
    return false;
  };

  // Check if a queen can attack the given square
  const canQueenAttack = (queenRow, queenCol, targetRow, targetCol, boardState) => {
    // Queen moves like a rook or bishop
    return canRookAttack(queenRow, queenCol, targetRow, targetCol, boardState) ||
           canBishopAttack(queenRow, queenCol, targetRow, targetCol, boardState);
  };

  // Check if a king can attack the given square
  const canKingAttack = (kingRow, kingCol, targetRow, targetCol) => {
    const rowDiff = Math.abs(kingRow - targetRow);
    const colDiff = Math.abs(kingCol - targetCol);
    
    // King can move 1 square in any direction
    return rowDiff <= 1 && colDiff <= 1;
  };

  // Get valid moves for a pawn
  const getPawnMoves = (row, col, color, moves) => {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Forward one square
    if (row + direction >= 0 && row + direction < BOARD_SIZE && !board[row + direction][col]) {
      moves.push([row + direction, col]);
      
      // Forward two squares from starting position
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push([row + 2 * direction, col]);
      }
    }
    
    // Diagonal captures
    const checkDiagonal = (rowOffset, colOffset) => {
      const newRow = row + rowOffset;
      const newCol = col + colOffset;
      
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (target) {
          const targetColor = target === target.toUpperCase() ? 'white' : 'black';
          if (targetColor !== color) {
            moves.push([newRow, newCol]);
          }
        }
      }
    };
    
    checkDiagonal(direction, -1); // Left diagonal
    checkDiagonal(direction, 1);  // Right diagonal
  };

  // Get valid moves for a rook
  const getRookMoves = (row, col, color, moves) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, down, left, right
    
    for (const [dx, dy] of directions) {
      let newRow = row + dx;
      let newCol = col + dy;
      
      while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (!target) {
          // Empty square, can move
          moves.push([newRow, newCol]);
        } else {
          // Square has a piece, check if it can be captured
          const targetColor = target === target.toUpperCase() ? 'white' : 'black';
          if (targetColor !== color) {
            moves.push([newRow, newCol]);
          }
          break; // Stop in this direction
        }
        
        newRow += dx;
        newCol += dy;
      }
    }
  };

  // Get valid moves for a knight
  const getKnightMoves = (row, col, color, moves) => {
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dx, dy] of knightMoves) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (!target || (target === target.toUpperCase() ? 'white' : 'black') !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
  };

  // Get valid moves for a bishop
  const getBishopMoves = (row, col, color, moves) => {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
    
    for (const [dx, dy] of directions) {
      let newRow = row + dx;
      let newCol = col + dy;
      
      while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (!target) {
          // Empty square, can move
          moves.push([newRow, newCol]);
        } else {
          // Square has a piece, check if it can be captured
          const targetColor = target === target.toUpperCase() ? 'white' : 'black';
          if (targetColor !== color) {
            moves.push([newRow, newCol]);
          }
          break; // Stop in this direction
        }
        
        newRow += dx;
        newCol += dy;
      }
    }
  };

  // Get valid moves for a queen
  const getQueenMoves = (row, col, color, moves) => {
    // Queen combines rook and bishop moves
    getRookMoves(row, col, color, moves);
    getBishopMoves(row, col, color, moves);
  };

  // Get valid moves for a king
  const getKingMoves = (row, col, color, moves) => {
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    for (const [dx, dy] of kingMoves) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (!target || (target === target.toUpperCase() ? 'white' : 'black') !== color) {
          // Check if the new position would be safe
          const tempBoard = board.map(row => [...row]);
          tempBoard[newRow][newCol] = tempBoard[row][col];
          tempBoard[row][col] = null;
          
          if (!isKingInCheck(tempBoard, newRow, newCol, color)) {
            moves.push([newRow, newCol]);
          }
        }
      }
    }
  };

  // Handle piece selection in edit mode
  const selectPiece = (piece) => {
    setSelected(piece);
  };

  // Render chess board
  const renderBoard = () => {
    if (!board || board.length === 0) return null;

    return (
      <div className="chess-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((piece, colIndex) => {
              const isSelected = selected && 
                (Array.isArray(selected) ? selected[0] === rowIndex && selected[1] === colIndex : false);
              const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
              
              return (
                <div 
                  key={colIndex} 
                  className={`
                    board-cell 
                    ${(rowIndex + colIndex) % 2 === 0 ? 'cell-light' : 'cell-dark'}
                    ${isSelected ? 'selected' : ''}
                    ${isValidMove ? 'valid-move' : ''}
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {piece && renderPiece(piece)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Render a chess piece
  const renderPiece = (piece) => {
    const pieceType = piece.toLowerCase();
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    
    const pieceSymbols = {
      'p': '♟', // pawn
      'r': '♜', // rook
      'n': '♞', // knight
      'b': '♝', // bishop
      'q': '♛', // queen
      'k': '♚'  // king
    };
    
    return (
      <span className={`chess-piece ${pieceColor}`}>
        {pieceSymbols[pieceType]}
      </span>
    );
  };

  // Render piece selector for edit mode
  const renderPieceSelector = () => {
    if (!isEditing) return null;
    
    const pieces = [
      'K', 'Q', 'R', 'B', 'N', 'P', // White pieces
      'k', 'q', 'r', 'b', 'n', 'p'  // Black pieces
    ];
    
    return (
      <div className="piece-selector">
        <h3>Select a piece to place:</h3>
        <div className="piece-options">
          {pieces.map((piece) => (
            <div 
              key={piece} 
              className={`piece-option ${selected === piece ? 'selected' : ''}`}
              onClick={() => selectPiece(piece)}
            >
              {renderPiece(piece)}
            </div>
          ))}
          <div 
            className={`piece-option delete ${selected === 'delete' ? 'selected' : ''}`}
            onClick={() => selectPiece('delete')}
          >
            ❌
          </div>
        </div>
      </div>
    );
  };

  // Render puzzle list
  const renderPuzzleList = () => {
    return (
      <div className="puzzle-list">
        <h2>Chess Puzzles</h2>
        <button onClick={createNewPuzzle}>Create New Puzzle</button>
        <ul>
          {puzzles.map((puzzle) => (
            <li key={puzzle.id} onClick={() => selectPuzzle(puzzle.id)}>
              {puzzle.name} - Difficulty: {renderDifficultyStars(puzzle.difficulty_rating)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render difficulty stars
  const renderDifficultyStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(10 - rating);
  };

  // Render puzzle editor
  const renderPuzzleEditor = () => {
    if (!currentPuzzle) return null;

    return (
      <div className="puzzle-editor">
        <h2>{isCreating ? 'Create New Puzzle' : 'Edit Puzzle'}</h2>
        <div className="form-group">
          <label>Puzzle Name:</label>
          <input 
            type="text" 
            value={puzzleName} 
            onChange={(e) => setPuzzleName(e.target.value)} 
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Difficulty (1-10):</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={difficulty} 
            onChange={(e) => setDifficulty(parseInt(e.target.value))} 
            disabled={!isEditing}
          />
          <span>{difficulty} {renderDifficultyStars(difficulty)}</span>
        </div>
        <div className="form-group">
          <label>Current Turn:</label>
          <select 
            value={currentTurn} 
            onChange={(e) => setCurrentTurn(e.target.value)}
            disabled={!isEditing}
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </div>
        <div className="buttons">
          {isEditing ? (
            <>
              <button onClick={savePuzzle}>Save</button>
              <button onClick={toggleEditMode}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={toggleEditMode}>Edit</button>
              {!isCreating && <button onClick={deletePuzzle}>Delete</button>}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chess-puzzle-container">
      {message && <div className="message">{message}</div>}
      <div className="main-content">
        <div className="left-panel">
          {renderPuzzleList()}
        </div>
        <div className="center-panel">
          {renderBoard()}
          {isEditing && renderPieceSelector()}
        </div>
        <div className="right-panel">
          {renderPuzzleEditor()}
        </div>
      </div>
    </div>
  );
};

export default ChessPuzzle;