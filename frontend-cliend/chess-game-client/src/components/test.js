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
    setChatMessages(prev => [...prev, message]);
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


 {/* Chat */}
 <div className="chat-panel">
 <div className="chat-messages">
 {chatMessages.map((msg, index) => (
   <div key={`msg-${index}`} className={`chat-message ${msg.color}`}>
     <span className="message-sender">{msg.sender}:</span>
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