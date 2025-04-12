import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaChessPawn, FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import './chessonline.css';

// Định nghĩa các hằng số
const BOARD_SIZE = 8;
const SOCKET_SERVER_URL = 'http://localhost:4000'; // Thay đổi URL server tùy theo cấu hình
const PIECE_SYMBOLS = {
  'p': <FaChessPawn className="piece black-piece" />,
  'r': <FaChessRook className="piece black-piece" />,
  'n': <FaChessKnight className="piece black-piece" />,
  'b': <FaChessBishop className="piece black-piece" />,
  'q': <FaChessQueen className="piece black-piece" />,
  'k': <FaChessKing className="piece black-piece" />,
  'P': <FaChessPawn className="piece white-piece" />,
  'R': <FaChessRook className="piece white-piece" />,
  'N': <FaChessKnight className="piece white-piece" />,
  'B': <FaChessBishop className="piece white-piece" />,
  'Q': <FaChessQueen className="piece white-piece" />,
  'K': <FaChessKing className="piece white-piece" />
};

const ChessOnline = () => {
  // Các state và ref
  const [board, setBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [playerColor, setPlayerColor] = useState(null);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [roomId, setRoomId] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [notification, setNotification] = useState(null);
  const [winner, setWinner] = useState(null);
  const [whiteCaptures, setWhiteCaptures] = useState([]);
  const [blackCaptures, setBlackCaptures] = useState([]);
  const [whiteTotal, setWhiteTotal] = useState(600); // 10 phút
  const [blackTotal, setBlackTotal] = useState(600);
  const [whiteMove, setWhiteMove] = useState(120); // 2 phút mỗi nước đi
  const [blackMove, setBlackMove] = useState(120);
  const [isWaiting, setIsWaiting] = useState(false);
  const [gameState, setGameState] = useState({
    whiteCastleKingSide: true,
    whiteCastleQueenSide: true,
    blackCastleKingSide: true,
    blackCastleQueenSide: true,
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    check: false,
    checkmate: false,
    stalemate: false
  });
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [promotionModal, setPromotionModal] = useState({
    visible: false,
    position: null,
    targetPosition: null
  });

  const socketRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Khởi tạo bàn cờ và socket khi component được mount
  useEffect(() => {
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

    setBoard(initialBoard);

    // Kết nối Socket.IO
    socketRef.current = io(SOCKET_SERVER_URL);

    // Đăng ký các sự kiện socket
    setupSocketEvents();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Cài đặt đồng hồ đếm thời gian
  useEffect(() => {
    if (gameStarted && !winner) {
      setupTimers();
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameStarted, currentTurn, winner]);

  // Thiết lập sự kiện socket
  const setupSocketEvents = () => {
    const socket = socketRef.current;

    socket.on('roomCreated', ({ roomId, color }) => {
      setRoomId(roomId);
      setPlayerColor(color);
      showNotification(`Đã tạo phòng: ${roomId}. Đang chờ đối thủ...`);
    });

    socket.on('roomJoined', ({ roomId, color }) => {
      setRoomId(roomId);
      setPlayerColor(color);
      showNotification(`Đã tham gia phòng: ${roomId}`);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
      showNotification('Trận đấu bắt đầu!');
    });

    socket.on('updateBoard', ({ board, turn, gameState }) => {
      setBoard(board);
      setCurrentTurn(turn);
      
      if (gameState) {
        setGameState(gameState);
        
        // Cập nhật danh sách quân cờ bị bắt
        if (gameState.capturedPieces) {
          setWhiteCaptures(gameState.capturedPieces.white || []);
          setBlackCaptures(gameState.capturedPieces.black || []);
        }
        
        // Hiển thị thông báo chiếu
        if (gameState.check && !gameState.checkmate) {
          showNotification(`${turn === 'white' ? 'Đen' : 'Trắng'} chiếu!`);
        }
      }
      
      // Xóa các ô được chọn sau khi cập nhật bàn cờ
      setSelected(null);
      setValidMoves([]);
    });

    socket.on('updateTimers', ({ whiteTotal, blackTotal, whiteMove, blackMove }) => {
      setWhiteTotal(whiteTotal);
      setBlackTotal(blackTotal);
      setWhiteMove(whiteMove);
      setBlackMove(blackMove);
    });

    socket.on('gameOver', (result) => {
      let message;
      
      if (result === 'draw') {
        message = 'Hòa cờ!';
        setWinner('draw');
      } else {
        message = `${result === 'white' ? 'Trắng' : 'Đen'} thắng!`;
        setWinner(result);
      }
      
      showNotification(message);
      setGameStarted(false);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    });

    socket.on('receiveMessage', (message) => {
      setChatMessages(prev => [...prev, {
        color: message.color,
        text: message.message,
        sender: message.sender
      }]);
    });

    socket.on('error', ({ message }) => {
      showNotification(`Lỗi: ${message}`, 'error');
    });

    socket.on('playerReadyToRestart', () => {
      showNotification('Đối thủ đã sẵn sàng chơi lại');
    });

    socket.on('waitingForOpponent', () => {
      showNotification('Đang chờ đối thủ...');
    });

    socket.on('bothPlayersReady', () => {
      showNotification('Cả hai người chơi đã sẵn sàng!');
    });

    socket.on('restartGame', () => {
      restartGame();
    });

    socket.on('playerDisconnected', ({ message }) => {
      showNotification(message);
      setGameStarted(false);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    });

    socket.on('waitingForMatch', () => {
      setIsWaiting(true);
      showNotification('Đang tìm đối thủ...');
    });

    socket.on('matchFound', ({ roomId, color }) => {
      setIsWaiting(false);
      showNotification('Đã tìm thấy đối thủ!');
      setRoomId(roomId);
      setPlayerColor(color);
    });

    socket.on('matchCancelled', () => {
      setIsWaiting(false);
      showNotification('Đã hủy tìm trận');
    });
  };

  

  // Thiết lập đồng hồ đếm thời gian
  const setupTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      if (currentTurn === 'white') {
        setWhiteTotal(prev => prev > 0 ? prev - 1 : 0);
        setWhiteMove(prev => prev > 0 ? prev - 1 : 0);
        
        // Kiểm tra hết thời gian
        if (whiteTotal <= 1 || whiteMove <= 1) {
          handleTimeOut('white');
        }
      } else {
        setBlackTotal(prev => prev > 0 ? prev - 1 : 0);
        setBlackMove(prev => prev > 0 ? prev - 1 : 0);
        
        // Kiểm tra hết thời gian
        if (blackTotal <= 1 || blackMove <= 1) {
          handleTimeOut('black');
        }
      }
    }, 1000);
  };

  // Xử lý khi hết thời gian
  const handleTimeOut = (color) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    const winner = color === 'white' ? 'black' : 'white';
    socketRef.current.emit('gameOver', { roomId, result: winner });
  };

  // Tạo phòng
  const createRoom = (color) => {
    socketRef.current.emit('createRoom', { color });
  };

  // Tham gia phòng
  const joinRoom = (id) => {
    socketRef.current.emit('joinRoom', { roomId: id });
  };

  // Tìm trận ngẫu nhiên
  const findRandomMatch = (preferredColor) => {
    socketRef.current.emit('findRandomMatch', { preferredColor });
  };

  // Hủy tìm trận
  const cancelFindMatch = () => {
    socketRef.current.emit('cancelFindMatch');
    setIsWaiting(false);
  };

  // Hiển thị thông báo
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Copy ID phòng vào clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showNotification('Đã sao chép ID phòng!');
  };

 // Cập nhật hàm gửi tin nhắn chat
 const sendMessage = (e) => {
  e.preventDefault();
  if (message.trim() && socketRef.current && roomId) {
    socketRef.current.emit('sendMessage', {
      roomId,
      message: message.trim(),
      color: playerColor,
      sender: playerColor === 'white' ? 'Trắng' : 'Đen'
    });
    
    // Bỏ đoạn thêm tin nhắn local
    // Để server là người duy nhất gửi tin nhắn đến tất cả người dùng
    
    setMessage('');
  }
};

  // Khởi động lại game
  const restartGame = () => {
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
    
    setBoard(initialBoard);
    setSelected(null);
    setValidMoves([]);
    setCurrentTurn('white');
    setWinner(null);
    setWhiteTotal(600);
    setBlackTotal(600);
    setWhiteMove(120);
    setBlackMove(120);
    setGameStarted(true);
    setLastMove(null);
    setHighlightedSquares([]);
    setGameState({
      whiteCastleKingSide: true,
      whiteCastleQueenSide: true,
      blackCastleKingSide: true,
      blackCastleQueenSide: true,
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
      check: false,
      checkmate: false,
      stalemate: false
    });
    setWhiteCaptures([]);
    setBlackCaptures([]);
  };

  // Sẵn sàng để khởi động lại
  const readyToRestart = () => {
    socketRef.current.emit('readyToRestart', { roomId });
    showNotification('Bạn đã sẵn sàng chơi lại');
  };

  // Kiểm tra nước đi hợp lệ
  const getValidMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece) return [];
    
    // Kiểm tra lượt chơi
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    if (pieceColor !== currentTurn) return [];
    
    // Chỉ cho phép người chơi di chuyển quân của mình
    if (pieceColor === 'white' && playerColor !== 'white') return [];
    if (pieceColor === 'black' && playerColor !== 'black') return [];
    
    const moves = [];
    const pieceType = piece.toLowerCase();
    
    // Kiểm tra các nước đi hợp lệ dựa trên loại quân cờ
    switch (pieceType) {
      case 'p': // Tốt
        getPawnMoves(row, col, pieceColor, moves);
        break;
      case 'r': // Xe
        getRookMoves(row, col, pieceColor, moves);
        break;
      case 'n': // Mã
        getKnightMoves(row, col, pieceColor, moves);
        break;
      case 'b': // Tượng
        getBishopMoves(row, col, pieceColor, moves);
        break;
      case 'q': // Hậu
        getQueenMoves(row, col, pieceColor, moves);
        break;
      case 'k': // Vua
        getKingMoves(row, col, pieceColor, moves);
        break;
      default:
        break;
    }
    
    // Lọc ra những nước đi không dẫn đến chiếu
    return filterMovesForCheck(row, col, moves, pieceColor);
  };

  // Lọc những nước đi dẫn đến chiếu
  const filterMovesForCheck = (startRow, startCol, moves, pieceColor) => {
    return moves.filter(([endRow, endCol]) => {
      // Tạo bản sao của bàn cờ
      const tempBoard = board.map(row => [...row]);
      
      // Mô phỏng nước đi
      const movingPiece = tempBoard[startRow][startCol];
      tempBoard[endRow][endCol] = movingPiece;
      tempBoard[startRow][startCol] = null;
      
      // Kiểm tra xem Vua có bị chiếu không sau nước đi
      const kingPosition = findKingPosition(tempBoard, pieceColor);
      if (!kingPosition) return true; // Nếu không tìm thấy Vua, vẫn cho phép nước đi (không xảy ra trong trò chơi thực)
      
      return !isKingInCheck(tempBoard, kingPosition[0], kingPosition[1], pieceColor);
    });
  };

  // Tìm vị trí của Vua
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

  // Kiểm tra xem Vua có đang bị chiếu không
  const isKingInCheck = (boardState, kingRow, kingCol, kingColor) => {
    const opponentColor = kingColor === 'white' ? 'black' : 'white';
    
    // Kiểm tra tất cả các ô trên bàn cờ
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = boardState[row][col];
        if (!piece) continue;
        
        // Nếu là quân của đối thủ
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        if (pieceColor !== opponentColor) continue;
        
        // Kiểm tra xem quân cờ này có thể tấn công Vua không
        const pieceType = piece.toLowerCase();
        let canAttackKing = false;
        
        switch (pieceType) {
          case 'p': // Tốt
            canAttackKing = canPawnAttack(row, col, kingRow, kingCol, pieceColor);
            break;
          case 'r': // Xe
            canAttackKing = canRookAttack(row, col, kingRow, kingCol, boardState);
            break;
          case 'n': // Mã
            canAttackKing = canKnightAttack(row, col, kingRow, kingCol);
            break;
          case 'b': // Tượng
            canAttackKing = canBishopAttack(row, col, kingRow, kingCol, boardState);
            break;
          case 'q': // Hậu
            canAttackKing = canQueenAttack(row, col, kingRow, kingCol, boardState);
            break;
          case 'k': // Vua
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

  // Các hàm kiểm tra tấn công của từng loại quân cờ
  const canPawnAttack = (pawnRow, pawnCol, targetRow, targetCol, pawnColor) => {
    const direction = pawnColor === 'white' ? -1 : 1;
    return pawnRow + direction === targetRow && (pawnCol + 1 === targetCol || pawnCol - 1 === targetCol);
  };

  const canRookAttack = (rookRow, rookCol, targetRow, targetCol, boardState) => {
    // Kiểm tra ngang
    if (rookRow === targetRow) {
      const start = Math.min(rookCol, targetCol);
      const end = Math.max(rookCol, targetCol);
      
      for (let col = start + 1; col < end; col++) {
        if (boardState[rookRow][col] !== null) return false;
      }
      return true;
    }
    
    // Kiểm tra dọc
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

  const canKnightAttack = (knightRow, knightCol, targetRow, targetCol) => {
    const rowDiff = Math.abs(knightRow - targetRow);
    const colDiff = Math.abs(knightCol - targetCol);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  const canBishopAttack = (bishopRow, bishopCol, targetRow, targetCol, boardState) => {
    const rowDiff = Math.abs(bishopRow - targetRow);
    const colDiff = Math.abs(bishopCol - targetCol);
    
    // Kiểm tra đường chéo
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

  const canQueenAttack = (queenRow, queenCol, targetRow, targetCol, boardState) => {
    // Hậu di chuyển như Xe hoặc Tượng
    return canRookAttack(queenRow, queenCol, targetRow, targetCol, boardState) ||
           canBishopAttack(queenRow, queenCol, targetRow, targetCol, boardState);
  };

  const canKingAttack = (kingRow, kingCol, targetRow, targetCol) => {
    const rowDiff = Math.abs(kingRow - targetRow);
    const colDiff = Math.abs(kingCol - targetCol);
    
    // Vua chỉ có thể di chuyển 1 ô theo mọi hướng
    return rowDiff <= 1 && colDiff <= 1;
  };

  // Lấy các nước đi hợp lệ cho từng loại quân cờ
  const getPawnMoves = (row, col, color, moves) => {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Di chuyển thẳng 1 ô
    if (row + direction >= 0 && row + direction < BOARD_SIZE && !board[row + direction][col]) {
      moves.push([row + direction, col]);
      
      // Di chuyển thẳng 2 ô từ vị trí ban đầu
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push([row + 2 * direction, col]);
      }
    }
    
    // Ăn quân theo đường chéo
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
        } else if (gameState.enPassantTarget && 
                   gameState.enPassantTarget[0] === newRow && 
                   gameState.enPassantTarget[1] === newCol) {
          // Bắt tốt qua đường
          moves.push([newRow, newCol]);
        }
      }
    };
    
    checkDiagonal(direction, -1); // Chéo trái
    checkDiagonal(direction, 1);  // Chéo phải
  };

  const getRookMoves = (row, col, color, moves) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Lên, xuống, trái, phải
    
    for (const [dx, dy] of directions) {
      let newRow = row + dx;
      let newCol = col + dy;
      
      while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (!target) {
          // Ô trống, có thể di chuyển
          moves.push([newRow, newCol]);
        } else {
          // Có quân cờ, kiểm tra xem có thể ăn không
          const targetColor = target === target.toUpperCase() ? 'white' : 'black';
          if (targetColor !== color) {
            moves.push([newRow, newCol]);
          }
          break; // Dừng lại vì không thể đi qua quân cờ
        }
        
        newRow += dx;
        newCol += dy;
      }
    }
  };

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

  const getBishopMoves = (row, col, color, moves) => {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Chéo trái trên, chéo phải trên, chéo trái dưới, chéo phải dưới
    
    for (const [dx, dy] of directions) {
      let newRow = row + dx;
      let newCol = col + dy;
      
      while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (!target) {
          // Ô trống, có thể di chuyển
          moves.push([newRow, newCol]);
        } else {
          // Có quân cờ, kiểm tra xem có thể ăn không
          const targetColor = target === target.toUpperCase() ? 'white' : 'black';
          if (targetColor !== color) {
            moves.push([newRow, newCol]);
          }
          break; // Dừng lại vì không thể đi qua quân cờ
        }
        
        newRow += dx;
        newCol += dy;
      }
    }
  };

  const getQueenMoves = (row, col, color, moves) => {
    // Hậu kết hợp các nước đi của Xe và Tượng
    getRookMoves(row, col, color, moves);
    getBishopMoves(row, col, color, moves);
  };

  const getKingMoves = (row, col, color, moves) => {
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    // Di chuyển thông thường của Vua
    for (const [dx, dy] of kingMoves) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        
        if (!target || (target === target.toUpperCase() ? 'white' : 'black') !== color) {
          // Cần kiểm tra xem ô mới có an toàn không (không bị chiếu)
          const tempBoard = board.map(row => [...row]);
          tempBoard[newRow][newCol] = tempBoard[row][col];
          tempBoard[row][col] = null;
          
          const isInCheck = isKingInCheck(tempBoard, newRow, newCol, color);
          if (!isInCheck) {
            moves.push([newRow, newCol]);
          }
        }
      }
    }
    
    // Nhập thành
    if (color === 'white') {
      // Nhập thành ngắn (phía vua)
      if (gameState.whiteCastleKingSide && !board[7][5] && !board[7][6] && board[7][7] === 'R') {
        if (!isKingInCheck(board, row, col, color) && 
            !isKingInCheck(board.map(r => [...r]), row, col + 1, color)) {
          moves.push([7, 6]); // Vị trí nhập thành
        }
      }
      
      // Nhập thành dài (phía hậu)
      if (gameState.whiteCastleQueenSide && !board[7][1] && !board[7][2] && !board[7][3] && board[7][0] === 'R') {
        if (!isKingInCheck(board, row, col, color) && 
            !isKingInCheck(board.map(r => [...r]), row, col - 1, color)) {
          moves.push([7, 2]); // Vị trí nhập thành
        }
      }
    } else {
      // Nhập thành ngắn (phía vua)
      if (gameState.blackCastleKingSide && !board[0][5] && !board[0][6] && board[0][7] === 'r') {
        if (!isKingInCheck(board, row, col, color) && 
            !isKingInCheck(board.map(r => [...r]), row, col + 1, color)) {
          moves.push([0, 6]); // Vị trí nhập thành
        }
      }
      
      // Nhập thành dài (phía hậu)
      if (gameState.blackCastleQueenSide && !board[0][1] && !board[0][2] && !board[0][3] && board[0][0] === 'r') {
        if (!isKingInCheck(board, row, col, color) && 
            !isKingInCheck(board.map(r => [...r]), row, col - 1, color)) {
          moves.push([0, 2]); // Vị trí nhập thành
        }
      }
    }
  };

  // Xử lý khi chọn một ô trên bàn cờ
  const handleCellClick = (row, col) => {
    if (winner || !gameStarted || currentTurn !== playerColor) return;
    
    // Nếu đang chọn thăng cấp
    if (promotionModal.visible) return;
    
    const piece = board[row][col];
    
    // Nếu đã chọn một quân cờ trước đó
    if (selected) {
      const [selectedRow, selectedCol] = selected;
      
      // Kiểm tra xem nước đi có hợp lệ không
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
      
      if (isValidMove) {
        // Thực hiện nước đi
        makeMove(selectedRow, selectedCol, row, col);
      } else if (piece && (piece === piece.toUpperCase() ? 'white' : 'black') === playerColor) {
        // Chọn một quân cờ khác cùng màu
        setSelected([row, col]);
        setValidMoves(getValidMoves(row, col));
      } else {
        // Bỏ chọn
        setSelected(null);
        setValidMoves([]);
      }
    } else if (piece && (piece === piece.toUpperCase() ? 'white' : 'black') === playerColor) {
      // Chọn một quân cờ mới
      setSelected([row, col]);
      setValidMoves(getValidMoves(row, col));
    }
  };

  // Thực hiện nước đi
  const makeMove = (startRow, startCol, endRow, endCol) => {
    // Tạo bản sao của bàn cờ
    const newBoard = board.map(row => [...row]);
    
    const piece = newBoard[startRow][startCol];
    const capturedPiece = newBoard[endRow][endCol];
    
    // Cập nhật vị trí quân cờ
    newBoard[endRow][endCol] = piece;
    newBoard[startRow][startCol] = null;
    
    // Cập nhật gameState
    const newGameState = {...gameState};
    let enPassantTarget = null;
    
    // Cập nhật lượt hiện tại
    const nextTurn = currentTurn === 'white' ? 'black' : 'white';
    
    // Xử lý tốt đi 2 ô (en passant)
    if (piece.toLowerCase() === 'p') {
      if (Math.abs(startRow - endRow) === 2) {
        // Tốt đi 2 ô, đặt en passant target
        enPassantTarget = [startRow + (endRow - startRow) / 2, startCol];
      } else if (endCol !== startCol && !capturedPiece) {
        // Kiểm tra en passant capture
        if (gameState.enPassantTarget && 
            gameState.enPassantTarget[0] === endRow && 
            gameState.enPassantTarget[1] === endCol) {
          // Xóa tốt bị bắt qua đường
          const captureRow = startRow;
          const captureCol = endCol;
          newBoard[captureRow][captureCol] = null;
        }
      }
      
      // Kiểm tra thăng cấp tốt
      if ((piece === 'P' && endRow === 0) || (piece === 'p' && endRow === 7)) {
        // Hiển thị modal thăng cấp
        setPromotionModal({
          visible: true,
          position: [startRow, startCol],
          targetPosition: [endRow, endCol]
        });
        return; // Dừng nước đi tại đây và chờ người chơi chọn quân thăng cấp
      }
    }
    
    newGameState.enPassantTarget = enPassantTarget;
    
    // Xử lý nhập thành
    if (piece.toLowerCase() === 'k') {
      if (piece === 'K') {
        newGameState.whiteCastleKingSide = false;
        newGameState.whiteCastleQueenSide = false;
      } else {
        newGameState.blackCastleKingSide = false;
        newGameState.blackCastleQueenSide = false;
      }
      
      // Nhập thành ngắn
      if (startCol === 4 && endCol === 6) {
        newBoard[startRow][5] = piece === 'K' ? 'R' : 'r'; // Di chuyển xe
        newBoard[startRow][7] = null; // Xóa xe ở vị trí cũ
      }
      
      // Nhập thành dài
      if (startCol === 4 && endCol === 2) {
        newBoard[startRow][3] = piece === 'K' ? 'R' : 'r'; // Di chuyển xe
        newBoard[startRow][0] = null; // Xóa xe ở vị trí cũ
      }
    }
    
    // Cập nhật trạng thái nhập thành khi xe di chuyển
    if (piece === 'R') {
      if (startRow === 7 && startCol === 0) {
        newGameState.whiteCastleQueenSide = false;
      } else if (startRow === 7 && startCol === 7) {
        newGameState.whiteCastleKingSide = false;
      }
    } else if (piece === 'r') {
      if (startRow === 0 && startCol === 0) {
        newGameState.blackCastleQueenSide = false;
      } else if (startRow === 0 && startCol === 7) {
        newGameState.blackCastleKingSide = false;
      }
    }
    
    // Kiểm tra chiếu và chiếu hết
    const kingColor = nextTurn;
    const kingPosition = findKingPosition(newBoard, kingColor);
    
    if (kingPosition) {
      const isInCheck = isKingInCheck(newBoard, kingPosition[0], kingPosition[1], kingColor);
      newGameState.check = isInCheck;
      
      // Kiểm tra chiếu hết và hòa cờ
      if (isInCheck) {
        const hasLegalMove = checkForLegalMoves(newBoard, kingColor, newGameState);
        newGameState.checkmate = !hasLegalMove;
      } else {
        // Kiểm tra hòa cờ (pat)
        const hasLegalMove = checkForLegalMoves(newBoard, kingColor, newGameState);
        newGameState.stalemate = !hasLegalMove;
      }
    }
    
    // Cập nhật số nước đi
    if (piece.toLowerCase() === 'p' || capturedPiece) {
      newGameState.halfMoveClock = 0;
    } else {
      newGameState.halfMoveClock++;
    }
    
    if (nextTurn === 'white') {
      newGameState.fullMoveNumber++;
    }
    
    // Lưu nước đi cuối cùng để highlight
    setLastMove([
      [startRow, startCol],
      [endRow, endCol]
    ]);
    
    // Cập nhật bộ đếm thời gian
    let newWhiteTotal = whiteTotal;
    let newBlackTotal = blackTotal;
    let newWhiteMove = currentTurn === 'white' ? 120 : whiteMove; // Reset nếu là lượt trắng
    let newBlackMove = currentTurn === 'black' ? 120 : blackMove; // Reset nếu là lượt đen
    
    // Gửi nước đi đến server
    socketRef.current.emit('move', {
      roomId,
      board: newBoard,
      turn: nextTurn,
      gameState: newGameState,
      whiteTotal: newWhiteTotal,
      blackTotal: newBlackTotal,
      whiteMove: newWhiteMove,
      blackMove: newBlackMove,
      capturedPiece
    });
    
    // Cập nhật state
    setBoard(newBoard);
    setCurrentTurn(nextTurn);
    setGameState(newGameState);
    setSelected(null);
    setValidMoves([]);
    setHighlightedSquares([[endRow, endCol]]);
    
    // Cập nhật đồng hồ
    setWhiteTotal(newWhiteTotal);
    setBlackTotal(newBlackTotal);
    setWhiteMove(newWhiteMove);
    setBlackMove(newBlackMove);
  };

  // Xử lý thăng cấp tốt
  const handlePromotion = (promotionPiece) => {
    if (!promotionModal.visible) return;
    
    const { position, targetPosition } = promotionModal;
    const [startRow, startCol] = position;
    const [endRow, endCol] = targetPosition;
    
    // Tạo bản sao của bàn cờ
    const newBoard = board.map(row => [...row]);
    
    // Lấy màu của quân tốt
    const color = newBoard[startRow][startCol] === 'P' ? 'white' : 'black';
    const newPiece = color === 'white' ? promotionPiece.toUpperCase() : promotionPiece.toLowerCase();
    
    // Cập nhật quân cờ
    const capturedPiece = newBoard[endRow][endCol];
    newBoard[endRow][endCol] = newPiece;
    newBoard[startRow][startCol] = null;
    
    // Cập nhật lượt hiện tại
    const nextTurn = currentTurn === 'white' ? 'black' : 'white';
    
    // Cập nhật gameState
    const newGameState = {...gameState, enPassantTarget: null};
    // Kiểm tra chiếu và chiếu hết
    const kingColor = nextTurn;
    const kingPosition = findKingPosition(newBoard, kingColor);
    
    if (kingPosition) {
      const isInCheck = isKingInCheck(newBoard, kingPosition[0], kingPosition[1], kingColor);
      newGameState.check = isInCheck;
      
      // Kiểm tra chiếu hết và hòa cờ
      if (isInCheck) {
        const hasLegalMove = checkForLegalMoves(newBoard, kingColor, newGameState);
        newGameState.checkmate = !hasLegalMove;
      } else {
        // Kiểm tra hòa cờ (pat)
        const hasLegalMove = checkForLegalMoves(newBoard, kingColor, newGameState);
        newGameState.stalemate = !hasLegalMove;
      }
    }
    
    // Lưu nước đi cuối cùng để highlight
    setLastMove([
      [startRow, startCol],
      [endRow, endCol]
    ]);
    
    // Cập nhật bộ đếm thời gian
    let newWhiteTotal = whiteTotal;
    let newBlackTotal = blackTotal;
    let newWhiteMove = currentTurn === 'white' ? 120 : whiteMove; // Reset nếu là lượt trắng
    let newBlackMove = currentTurn === 'black' ? 120 : blackMove; // Reset nếu là lượt đen
    
    // Gửi nước đi đến server
    socketRef.current.emit('move', {
      roomId,
      board: newBoard,
      turn: nextTurn,
      gameState: newGameState,
      whiteTotal: newWhiteTotal,
      blackTotal: newBlackTotal,
      whiteMove: newWhiteMove,
      blackMove: newBlackMove,
      capturedPiece
    });
    
    // Cập nhật state
    setBoard(newBoard);
    setCurrentTurn(nextTurn);
    setGameState(newGameState);
    setSelected(null);
    setValidMoves([]);
    setHighlightedSquares([[endRow, endCol]]);
    
    // Cập nhật đồng hồ
    setWhiteTotal(newWhiteTotal);
    setBlackTotal(newBlackTotal);
    setWhiteMove(newWhiteMove);
    setBlackMove(newBlackMove);
    
    // Đóng modal thăng cấp
    setPromotionModal({
      visible: false,
      position: null,
      targetPosition: null
    });
  };

  // Kiểm tra xem có nước đi hợp lệ nào không (cho chiếu hết / hòa cờ)
  const checkForLegalMoves = (boardState, color, currentGameState) => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = boardState[row][col];
        if (!piece) continue;
        
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        if (pieceColor !== color) continue;
        
        const pieceType = piece.toLowerCase();
        const moves = [];
        
        // Kiểm tra các nước đi tiềm năng
        switch (pieceType) {
          case 'p': // Tốt
            getPawnMoves(row, col, pieceColor, moves);
            break;
          case 'r': // Xe
            getRookMoves(row, col, pieceColor, moves);
            break;
          case 'n': // Mã
            getKnightMoves(row, col, pieceColor, moves);
            break;
          case 'b': // Tượng
            getBishopMoves(row, col, pieceColor, moves);
            break;
          case 'q': // Hậu
            getQueenMoves(row, col, pieceColor, moves);
            break;
          case 'k': // Vua
            getKingMoves(row, col, pieceColor, moves);
            break;
          default:
            break;
        }
        
        // Lọc ra những nước đi không dẫn đến chiếu
        const legalMoves = filterMovesForCheck(row, col, moves, pieceColor);
        if (legalMoves.length > 0) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Format time để hiển thị
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Kiểm tra xem ô có phải là nước đi hợp lệ không
  const isValidMove = (row, col) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  // Kiểm tra xem ô có được highlight không (nước đi cuối cùng)
  const isHighlighted = (row, col) => {
    if (!lastMove) return false;
    return (lastMove[0][0] === row && lastMove[0][1] === col) || 
           (lastMove[1][0] === row && lastMove[1][1] === col);
  };

  // Hiển thị component chính
  return (
    <div className="chess-online-container">
      {/* Thông báo */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="chess-game-container">
        {/* Panel thông tin */}
        <div className="info-panel">
          <h2>Chess Online</h2>
          
          {!roomId ? (
            <div className="menu-panel">
              <div className="menu-section">
                <h3>Tạo phòng mới</h3>
                <div className="button-group">
                  <button onClick={() => createRoom('white')}>Chơi Trắng</button>
                  <button onClick={() => createRoom('black')}>Chơi Đen</button>
                  <button onClick={() => createRoom('random')}>Ngẫu nhiên</button>
                </div>
              </div>
              
              <div className="menu-section">
                <h3>Tham gia phòng</h3>
                <div className="join-room">
                  <input 
                    type="text" 
                    placeholder="Nhập ID phòng"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button onClick={() => joinRoom(message)}>Tham gia</button>
                </div>
              </div>
              
              <div className="menu-section">
                <h3>Tìm trận nhanh</h3>
                <div className="button-group">
                  {!isWaiting ? (
                    <>
                      <button onClick={() => findRandomMatch('white')}>Chơi Trắng</button>
                      <button onClick={() => findRandomMatch('black')}>Chơi Đen</button>
                      <button onClick={() => findRandomMatch('random')}>Ngẫu nhiên</button>
                    </>
                  ) : (
                    <button onClick={cancelFindMatch}>Hủy tìm trận</button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="game-info">
              <div className="room-info">
                <div className="room-id">
                  <span>Phòng: {roomId}</span>
                  <button className="copy-button" onClick={copyRoomId}>
                    <MdContentCopy />
                  </button>
                </div>
                <div className="player-info">
                  <div className="player">
                    <span>Bạn: {playerColor === 'white' ? 'Trắng' : 'Đen'}</span>
                  </div>
                  <div className="turn-info">
                    <span>Lượt: {currentTurn === 'white' ? 'Trắng' : 'Đen'}</span>
                  </div>
                </div>
                {gameState.check && !gameState.checkmate && (
                  <div className="check-info">Chiếu!</div>
                )}
                {gameState.checkmate && (
                  <div className="checkmate-info">Chiếu hết!</div>
                )}
                {gameState.stalemate && (
                  <div className="stalemate-info">Hòa cờ!</div>
                )}
              </div>
              
              {/* Hiển thị quân cờ bị bắt */}
              <div className="captured-pieces">
                <div className="white-captures">
                  {whiteCaptures.map((piece, index) => (
                    <div key={`white-cap-${index}`} className="captured-piece">
                      {PIECE_SYMBOLS[piece]}
                    </div>
                  ))}
                </div>
                <div className="black-captures">
                  {blackCaptures.map((piece, index) => (
                    <div key={`black-cap-${index}`} className="captured-piece">
                      {PIECE_SYMBOLS[piece]}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Đồng hồ */}
              <div className="timers">
                <div className="timer white-timer">
                  <div className="timer-label">Trắng:</div>
                  <div className="timer-time">
                    <div className="total-time">{formatTime(whiteTotal)}</div>
                    <div className="move-time">{formatTime(whiteMove)}</div>
                  </div>
                </div>
                <div className="timer black-timer">
                  <div className="timer-label">Đen:</div>
                  <div className="timer-time">
                    <div className="total-time">{formatTime(blackTotal)}</div>
                    <div className="move-time">{formatTime(blackMove)}</div>
                  </div>
                </div>
              </div>
              
              {/* Khởi động lại game */}
              {winner && (
                <div className="restart-section">
                  <button onClick={readyToRestart}>Chơi lại</button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Bàn cờ */}
        <div className="chess-board">
          {board && board.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="board-row">
              {row.map((cell, colIndex) => {
                const isWhiteCell = (rowIndex + colIndex) % 2 === 0;
                const isSelectedCell = selected && selected[0] === rowIndex && selected[1] === colIndex;
                const isValidMoveCell = isValidMove(rowIndex, colIndex);
                const isHighlightedCell = isHighlighted(rowIndex, colIndex);
                
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`board-cell ${isWhiteCell ? 'white-cell' : 'black-cell'} 
                                ${isSelectedCell ? 'selected' : ''} 
                                ${isValidMoveCell ? 'valid-move' : ''} 
                                ${isHighlightedCell ? 'highlighted' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell && PIECE_SYMBOLS[cell]}
                    {/* Hiển thị kí hiệu quân cờ */}
                    
                    {/* Hiển thị dấu cho các nước đi hợp lệ */}
                    {isValidMoveCell && !cell && (
                      <div className="move-marker"></div>
                    )}
                    {isValidMoveCell && cell && (
                      <div className="capture-marker"></div>
                    )}
                    
                    {/* Hiển thị tọa độ bàn cờ */}
                    {colIndex === 0 && (
                      <div className="row-label">
                        {8 - rowIndex}
                      </div>
                    )}
                    {rowIndex === 7 && (
                      <div className="col-label">
                        {String.fromCharCode(97 + colIndex)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Modal thăng cấp tốt */}
          {promotionModal.visible && (
            <div className="promotion-modal">
              <div className="promotion-options">
                <div className="promotion-title">Chọn quân thăng cấp:</div>
                <div className="promotion-pieces">
                  <div onClick={() => handlePromotion('q')} className="promotion-piece">
                    {playerColor === 'white' ? PIECE_SYMBOLS['Q'] : PIECE_SYMBOLS['q']}
                  </div>
                  <div onClick={() => handlePromotion('r')} className="promotion-piece">
                    {playerColor === 'white' ? PIECE_SYMBOLS['R'] : PIECE_SYMBOLS['r']}
                  </div>
                  <div onClick={() => handlePromotion('n')} className="promotion-piece">
                    {playerColor === 'white' ? PIECE_SYMBOLS['N'] : PIECE_SYMBOLS['n']}
                  </div>
                  <div onClick={() => handlePromotion('b')} className="promotion-piece">
                    {playerColor === 'white' ? PIECE_SYMBOLS['B'] : PIECE_SYMBOLS['b']}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="chat-panel">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={`msg-${index}`} className={`chat-message ${msg.color}`}>
                <span className="message-sender">{msg.color === 'white' ? 'Trắng' : 'Đen'}:</span>
                <span className="message-content">{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!gameStarted && !roomId}
            />
            <button type="submit" disabled={!gameStarted && !roomId}>Gửi</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChessOnline;