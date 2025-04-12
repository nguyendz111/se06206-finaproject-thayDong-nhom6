import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BOARD_SIZE = 8;

const ChessPuzzleClient = () => {
  // States
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [board, setBoard] = useState([]);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, checkmate, stalemate
  const [message, setMessage] = useState('');
  const [turn, setTurn] = useState('white'); // Player is always white, AI is black
  const [thinking, setThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);

  // Fetch puzzles from the server
  useEffect(() => {
    fetchPuzzles();
  }, []);

  const fetchPuzzles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/puzzles');
      setPuzzles(response.data);
      setMessage('Select a puzzle to play');
    } catch (error) {
      console.error('Error fetching puzzles:', error);
      setMessage('Failed to fetch puzzles from server');
    }
  };

  // Select a puzzle to play
  const selectPuzzle = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3001/puzzles/${id}`);
      const puzzle = response.data;
      
      setCurrentPuzzle(puzzle);
      const boardState = JSON.parse(puzzle.board_state);
      setBoard(boardState);
      setTurn('white'); // Player always starts as white
      setSelected(null);
      setValidMoves([]);
      setGameStatus('playing');
      setMessage(`Playing: ${puzzle.name} - Difficulty: ${puzzle.difficulty_rating}/10`);
      setMoveHistory([]);
      
      // If the puzzle starts with black's turn, let AI make a move
      if (puzzle.current_turn === 'black') {
        setTimeout(() => makeAIMove(boardState), 1000);
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      setMessage('Failed to load the selected puzzle');
    }
  };

  // Handle cell click - Only allow moves for player's pieces (white)
  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing' || turn !== 'white' || thinking) return;
    
    const piece = board[row][col];
    
    if (selected) {
      const [selectedRow, selectedCol] = selected;
      
      // Check if the move is valid
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
      
      if (isValidMove) {
        // Make the move
        const newBoard = board.map(r => [...r]);
        const movingPiece = newBoard[selectedRow][selectedCol];
        newBoard[row][col] = movingPiece;
        newBoard[selectedRow][selectedCol] = null;
        
        // Check for pawn promotion
        if (movingPiece === 'P' && row === 0) {
          newBoard[row][col] = 'Q'; // Auto-promote to queen
        }
        
        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);
        
        // Add move to history
        const notation = generateMoveNotation(selectedRow, selectedCol, row, col, movingPiece, newBoard[row][col], !!board[row][col]);
        setMoveHistory([...moveHistory, notation]);
        
        // Check game status after player's move
        const status = checkGameStatus(newBoard, 'black');
        if (status !== 'playing') {
          setGameStatus(status);
          setMessage(status === 'checkmate' ? 'Checkmate! You win!' : 'Stalemate! Game drawn.');
          return;
        }
        
        // AI's turn
        setTurn('black');
        setThinking(true);
        setMessage('AI is thinking...');
        
        setTimeout(() => {
          makeAIMove(newBoard);
        }, 1000);
      } else if (piece && piece === piece.toUpperCase()) { // Select another white piece
        setSelected([row, col]);
        setValidMoves(getValidMoves(row, col, board));
      } else {
        // Deselect
        setSelected(null);
        setValidMoves([]);
      }
    } else if (piece && piece === piece.toUpperCase()) { // Select a white piece
      setSelected([row, col]);
      setValidMoves(getValidMoves(row, col, board));
    }
  };

  // Generate algebraic chess notation for a move
  const generateMoveNotation = (startRow, startCol, endRow, endCol, piece, promotedPiece, isCapture) => {
    const pieceSymbols = {
      'P': '', 'R': 'R', 'N': 'N', 'B': 'B', 'Q': 'Q', 'K': 'K',
      'p': '', 'r': 'R', 'n': 'N', 'b': 'B', 'q': 'Q', 'k': 'K'
    };
    
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    let notation = '';
    
    // Add piece symbol (except for pawns)
    notation += pieceSymbols[piece];
    
    // Add starting position for disambiguating
    if ((piece === 'P' || piece === 'p') && isCapture) {
      notation += files[startCol];
    }
    
    // Add capture symbol
    if (isCapture) {
      notation += 'x';
    }
    
    // Add destination square
    notation += files[endCol] + ranks[endRow];
    
    // Add promotion
    if ((piece === 'P' || piece === 'p') && (promotedPiece !== 'P' && promotedPiece !== 'p')) {
      notation += '=' + promotedPiece.toUpperCase();
    }
    
    return notation;
  };

  // Make AI move
  const makeAIMove = (currentBoard) => {
    // Simple AI implementation
    const possibleMoves = [];
    
    // Find all possible moves for black pieces
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = currentBoard[row][col];
        if (piece && piece === piece.toLowerCase()) { // Black piece
          const moves = getValidMoves(row, col, currentBoard);
          
          moves.forEach(([endRow, endCol]) => {
            // Evaluate move
            const newBoard = currentBoard.map(r => [...r]);
            const capturedPiece = newBoard[endRow][endCol];
            const movingPiece = newBoard[row][col];
            
            newBoard[endRow][endCol] = movingPiece;
            newBoard[row][col] = null;
            
            // Check for pawn promotion
            if (movingPiece === 'p' && endRow === 7) {
              newBoard[endRow][endCol] = 'q'; // Auto-promote to queen
            }
            
            // Calculate score (higher is better for black)
            let score = 0;
            
            // Piece value for captures
            if (capturedPiece) {
              const pieceValues = {
                'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100,
                'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100
              };
              score += pieceValues[capturedPiece];
            }
            
            // Center control
            if ((endRow === 3 || endRow === 4) && (endCol === 3 || endCol === 4)) {
              score += 0.5;
            }
            
            // Add some randomness for variety
            score += Math.random() * 0.2;
            
            possibleMoves.push({
              startRow: row,
              startCol: col,
              endRow,
              endCol,
              score,
              piece: movingPiece,
              promotion: movingPiece === 'p' && endRow === 7 ? 'q' : null,
              capture: !!capturedPiece
            });
          });
        }
      }
    }
    
    // Sort moves by score and pick the best one
    possibleMoves.sort((a, b) => b.score - a.score);
    
    if (possibleMoves.length > 0) {
      const bestMove = possibleMoves[0];
      
      // Execute the move
      const newBoard = currentBoard.map(r => [...r]);
      const movingPiece = newBoard[bestMove.startRow][bestMove.startCol];
      
      newBoard[bestMove.endRow][bestMove.endCol] = bestMove.promotion || movingPiece;
      newBoard[bestMove.startRow][bestMove.startCol] = null;
      
      setBoard(newBoard);
      
      // Add move to history
      const notation = generateMoveNotation(
        bestMove.startRow, 
        bestMove.startCol, 
        bestMove.endRow, 
        bestMove.endCol,
        bestMove.piece, 
        bestMove.promotion || bestMove.piece,
        bestMove.capture
      );
      setMoveHistory([...moveHistory, notation]);
      
      // Check game status after AI's move
      const status = checkGameStatus(newBoard, 'white');
      if (status !== 'playing') {
        setGameStatus(status);
        setMessage(status === 'checkmate' ? 'Checkmate! AI wins!' : 'Stalemate! Game drawn.');
      } else {
        setTurn('white');
        setMessage('Your turn');
      }
    } else {
      // No moves available for AI
      setGameStatus('stalemate');
      setMessage('Stalemate! Game drawn.');
    }
    
    setThinking(false);
  };

  // Check for checkmate or stalemate
  const checkGameStatus = (boardState, playerToMove) => {
    const isKingInCheck = checkForCheck(boardState, playerToMove);
    const hasLegalMoves = checkForLegalMoves(boardState, playerToMove);
    
    if (!hasLegalMoves) {
      return isKingInCheck ? 'checkmate' : 'stalemate';
    }
    
    return 'playing';
  };

  // Check if the player is in check
  const checkForCheck = (boardState, playerColor) => {
    // Find the king
    const kingSymbol = playerColor === 'white' ? 'K' : 'k';
    let kingRow = -1, kingCol = -1;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState[row][col] === kingSymbol) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }
    
    if (kingRow === -1) {
      // King not found (shouldn't happen in a valid board position)
      return false;
    }
    
    // Check if any opponent piece can attack the king
    const opponentColor = playerColor === 'white' ? 'black' : 'white';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = boardState[row][col];
        if (!piece) continue;
        
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        if (pieceColor !== opponentColor) continue;
        
        const moves = getRawMoves(row, col, boardState);
        if (moves.some(([r, c]) => r === kingRow && c === kingCol)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Check if the player has any legal moves
  const checkForLegalMoves = (boardState, playerColor) => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = boardState[row][col];
        if (!piece) continue;
        
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        if (pieceColor !== playerColor) continue;
        
        const moves = getValidMoves(row, col, boardState);
        if (moves.length > 0) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Get all valid moves for a piece
  const getValidMoves = (row, col, boardState) => {
    const piece = boardState[row][col];
    if (!piece) return [];
    
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    
    // Get raw moves based on piece type
    const rawMoves = getRawMoves(row, col, boardState);
    
    // Filter moves that would result in check
    return rawMoves.filter(([endRow, endCol]) => {
      // Simulate the move
      const tempBoard = boardState.map(r => [...r]);
      tempBoard[endRow][endCol] = tempBoard[row][col];
      tempBoard[row][col] = null;
      
      // Check if the king would be in check after the move
      return !checkForCheck(tempBoard, pieceColor);
    });
  };

  // Get raw moves without check validation
  const getRawMoves = (row, col, boardState) => {
    const piece = boardState[row][col];
    if (!piece) return [];
    
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    const pieceType = piece.toLowerCase();
    const moves = [];
    
    switch (pieceType) {
      case 'p': // Pawn
        getPawnMoves(row, col, pieceColor, boardState, moves);
        break;
      case 'r': // Rook
        getRookMoves(row, col, pieceColor, boardState, moves);
        break;
      case 'n': // Knight
        getKnightMoves(row, col, pieceColor, boardState, moves);
        break;
      case 'b': // Bishop
        getBishopMoves(row, col, pieceColor, boardState, moves);
        break;
      case 'q': // Queen
        getQueenMoves(row, col, pieceColor, boardState, moves);
        break;
      case 'k': // King
        getKingMoves(row, col, pieceColor, boardState, moves);
        break;
      default:
        break;
    }
    
    return moves;
  };

  // Get pawn moves
  const getPawnMoves = (row, col, color, boardState, moves) => {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Forward one square
    if (row + direction >= 0 && row + direction < BOARD_SIZE && !boardState[row + direction][col]) {
      moves.push([row + direction, col]);
      
      // Forward two squares from starting position
      if (row === startRow && !boardState[row + 2 * direction][col]) {
        moves.push([row + 2 * direction, col]);
      }
    }
    
    // Diagonal captures
    for (const colOffset of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + colOffset;
      
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = boardState[newRow][newCol];
        
        if (target) {
          const targetColor = target === target.toUpperCase() ? 'white' : 'black';
          if (targetColor !== color) {
            moves.push([newRow, newCol]);
          }
        }
      }
    }
  };

  // Get rook moves
  const getRookMoves = (row, col, color, boardState, moves) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, down, left, right
    
    for (const [dx, dy] of directions) {
      let newRow = row + dx;
      let newCol = col + dy;
      
      while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = boardState[newRow][newCol];
        
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

  // Get knight moves
  const getKnightMoves = (row, col, color, boardState, moves) => {
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dx, dy] of knightMoves) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = boardState[newRow][newCol];
        
        if (!target || (target === target.toUpperCase() ? 'white' : 'black') !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
  };

  // Get bishop moves
  const getBishopMoves = (row, col, color, boardState, moves) => {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
    
    for (const [dx, dy] of directions) {
      let newRow = row + dx;
      let newCol = col + dy;
      
      while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = boardState[newRow][newCol];
        
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

  // Get queen moves
  const getQueenMoves = (row, col, color, boardState, moves) => {
    // Queen combines rook and bishop moves
    getRookMoves(row, col, color, boardState, moves);
    getBishopMoves(row, col, color, boardState, moves);
  };

  // Get king moves
  const getKingMoves = (row, col, color, boardState, moves) => {
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    for (const [dx, dy] of kingMoves) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = boardState[newRow][newCol];
        
        if (!target || (target === target.toUpperCase() ? 'white' : 'black') !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
  };


  const renderBoard = () => {
    if (!board || board.length === 0) return null;
  
    return (
      <div className="grid grid-cols-8 border-2 border-gray-800 w-full h-full" style={{ width: '32rem', height: '32rem' }}>
        {board.map((row, rowIndex) => (
          row.map((piece, colIndex) => {
            const isSelected = selected && selected[0] === rowIndex && selected[1] === colIndex;
            const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
            const isPlayerPiece = piece && piece === piece.toUpperCase(); // White pieces are player's
            
            // Determine square color using standard chess colors
            const squareColor = (rowIndex + colIndex) % 2 === 0 ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
            
            return (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`
                  flex items-center justify-center
                  ${squareColor}
                  ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                  ${isValidMove ? 'ring-4 ring-green-500 ring-inset' : ''}
                  ${(isPlayerPiece && turn === 'white') || isValidMove ? 'cursor-pointer' : ''}
                  relative
                `}
                style={{ width: '4rem', height: '4rem' }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {/* Coordinate labels - make them more subtle */}
                {colIndex === 0 && (
                  <span className="absolute top-1 left-1 text-sm font-bold opacity-70">
                    {8 - rowIndex}
                  </span>
                )}
                {rowIndex === 7 && (
                  <span className="absolute bottom-1 right-1 text-sm font-bold opacity-70">
                    {String.fromCharCode(97 + colIndex)}
                  </span>
                )}
                
                {piece && renderPiece(piece)}
              </div>
            );
          })
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
      <span className={`text-5xl ${pieceColor === 'white' ? 'text-white' : 'text-black'} select-none drop-shadow-md`}>
        {pieceSymbols[pieceType]}
      </span>
    );
  };

  // Render puzzle list
  const renderPuzzleList = () => {
    return (
      <div className="w-64 p-4 bg-amber-50 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-800">Chess Puzzles</h2>
        <div className="h-64 overflow-y-auto">
          <ul className="space-y-2">
            {puzzles.map((puzzle) => (
              <li 
                key={puzzle.id} 
                className="p-2 hover:bg-amber-100 cursor-pointer rounded transition-colors"
                onClick={() => selectPuzzle(puzzle.id)}
              >
                <div className="font-medium">{puzzle.name}</div>
                <div className="text-sm text-amber-700">
                  Difficulty: {puzzle.difficulty_rating}/10 
                  <span className="text-amber-500 ml-1">
                    {"★".repeat(Math.min(puzzle.difficulty_rating, 10))}
                    {"☆".repeat(Math.max(0, 10 - puzzle.difficulty_rating))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Render game controls
  const renderGameControls = () => {
    if (!currentPuzzle) return null;

    return (
      <div className="w-64 p-4 bg-amber-50 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-2 text-amber-800">{currentPuzzle.name}</h2>
        <div className="mb-4">
          <span className="text-sm text-amber-700">
            Difficulty: {currentPuzzle.difficulty_rating}/10
            <span className="text-amber-500 ml-1">
              {"★".repeat(Math.min(currentPuzzle.difficulty_rating, 10))}
              {"☆".repeat(Math.max(0, 10 - currentPuzzle.difficulty_rating))}
            </span>
          </span>
        </div>
        
        <div className="mb-4">
          <div className="font-medium">Status: 
            <span className={`ml-2 ${gameStatus === 'checkmate' || gameStatus === 'stalemate' ? 
              (gameStatus === 'checkmate' && turn === 'black' ? 'text-green-600' : 'text-red-600') : 
              'text-green-600'}`}>
              {gameStatus === 'idle' ? 'Select a puzzle' : 
               gameStatus === 'playing' ? 'In progress' : 
               gameStatus === 'checkmate' ? 'Checkmate' : 'Stalemate'}
            </span>
          </div>
          <div className="font-medium">Turn: 
            <span className={`ml-2 ${turn === 'white' ? 'text-white bg-black px-1' : 'text-black bg-gray-200 px-1'}`}>
              {turn === 'white' ? 'White (You)' : 'Black (AI)'}
            </span>
          </div>
        </div>
        
        {gameStatus === 'playing' && (
          <div className="mb-4">
            <p className="text-sm text-amber-800">{message}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <button 
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            onClick={() => selectPuzzle(currentPuzzle.id)}
          >
            Restart
          </button>
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            onClick={() => {
              setCurrentPuzzle(null);
              setBoard([]);
              setSelected(null);
              setValidMoves([]);
              setGameStatus('idle');
              setMessage('Select a puzzle to play');
              setMoveHistory([]);
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  };

  // Render move history
  const renderMoveHistory = () => {
    if (!currentPuzzle || moveHistory.length === 0) return null;

    return (
      <div className="w-64 p-4 bg-amber-50 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-800">Move History</h2>
        <div className="h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">White</th>
                <th className="text-left">Black</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, index) => (
                <tr key={index} className="hover:bg-amber-100">
                  <td className="py-1">{index + 1}.</td>
                  <td className="py-1 font-mono">{moveHistory[index * 2] || ''}</td>
                  <td className="py-1 font-mono">{moveHistory[index * 2 + 1] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-6 bg-amber-100 min-h-screen">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Chess Puzzle Challenge</h1>
      
      {gameStatus === 'checkmate' || gameStatus === 'stalemate' ? (
        <div className="bg-amber-50 p-3 rounded-lg shadow mb-6 text-center">
          <span className="text-xl font-bold text-amber-800">{message}</span>
        </div>
      ) : (
        message && (
          <div className="bg-amber-50 p-3 rounded-lg shadow mb-6">
            <span className="text-amber-800">{message}</span>
          </div>
        )
      )}
      
      <div className="flex flex-wrap justify-center gap-6">
        {/* Left column - Puzzle list */}
        {!currentPuzzle && renderPuzzleList()}
        
        {/* Middle column - Chess board */}
        <div className="flex flex-col items-center">
          {renderBoard()}
          
          {thinking && (
            <div className="mt-4 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div>
              <p className="mt-2 text-amber-800">AI is thinking...</p>
            </div>
          )}
        </div>
        
        {/* Right column - Game controls and move history */}
        <div className="flex flex-col gap-6">
          {currentPuzzle && renderGameControls()}
          {currentPuzzle && renderMoveHistory()}
        </div>
      </div>
    </div>
  );
};

export default ChessPuzzleClient;