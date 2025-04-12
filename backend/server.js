const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// Initialize express app and server
const app = express();
app.use(cors());
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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

const waitingPlayers = {
  white: null,
  black: null,
  any: []  // Người chơi không chọn màu cụ thể
};

// Game rooms data structure
const rooms = new Map();

// Spectators tracking
const spectators = new Map(); // Map để lưu các spectator trong các phòng

// Initial board state for chess
const initialBoardState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

// Hàm để lấy thông tin hiển thị cho monitor
const getRoomDataForMonitor = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  return {
    id: roomId,
    players: room.players,
    board: room.board,
    currentTurn: room.currentTurn,
    gameStarted: room.gameStarted,
    timers: room.timers,
    gameState: room.gameState,
    messages: room.messages || []
  };
};

// Hàm để cập nhật thông tin phòng cho tất cả các spectator
const updateRoomForSpectators = (roomId) => {
  const roomData = getRoomDataForMonitor(roomId);
  if (!roomData) return;
  
  // Gửi cập nhật đến tất cả spectator trong phòng
  io.to(`spectator-${roomId}`).emit('roomUpdated', roomData);
};

// Gửi danh sách phòng cho tất cả các kết nối monitor
const broadcastActiveRooms = () => {
  const activeRooms = [];
  for (const [roomId, room] of rooms.entries()) {
    activeRooms.push(getRoomDataForMonitor(roomId));
  }
  io.to('monitors').emit('activeRoomsList', activeRooms);
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle monitor connection - get active rooms
  socket.on('getActiveRooms', () => {
    socket.join('monitors'); // Join the monitors group
    
    const activeRooms = [];
    for (const [roomId, room] of rooms.entries()) {
      activeRooms.push(getRoomDataForMonitor(roomId));
    }
    
    socket.emit('activeRoomsList', activeRooms);
  });

  // Handle spectator joining a room
  socket.on('joinAsSpectator', ({ roomId }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Phòng không tồn tại' });
      return;
    }
    
    // Tham gia phòng như một spectator
    const spectatorRoom = `spectator-${roomId}`;
    socket.join(spectatorRoom);
    
    // Theo dõi spectator
    if (!spectators.has(roomId)) {
      spectators.set(roomId, new Set());
    }
    spectators.get(roomId).add(socket.id);
    
    // Gửi dữ liệu phòng cho spectator
    const roomData = getRoomDataForMonitor(roomId);
    socket.emit('spectatorJoined', roomData);
    
    console.log(`Spectator ${socket.id} joined room: ${roomId}`);
  });

  // Create a new game room
  socket.on('createRoom', ({ color }) => {
    const roomId = uuidv4().substring(0, 8); // Create a shorter room ID for convenience
    
    // Initialize room data
    rooms.set(roomId, {
      players: {
        [socket.id]: {
          id: socket.id,
          color: color,
          ready: true
        }
      },
      board: JSON.parse(JSON.stringify(initialBoardState)), // Deep copy the initial board
      currentTurn: 'white',
      gameStarted: false,
      messages: [],
      timers: {
        whiteTotal: 600, // 10 minutes in seconds
        blackTotal: 600,
        whiteMove: 120, // 2 minutes per move
        blackMove: 120
      },
      gameState: {
        whiteCastleKingSide: true,
        whiteCastleQueenSide: true,
        blackCastleKingSide: true,
        blackCastleQueenSide: true,
        enPassantTarget: null,
        halfMoveClock: 0,
        fullMoveNumber: 1,
        check: false,
        checkmate: false,
        stalemate: false,
        capturedPieces: {
          white: [],
          black: []
        }
      }
    });
    
    // Join the room
    socket.join(roomId);
    
    // Notify the client
    socket.emit('roomCreated', { roomId, color });
    
    // Broadcast new room to monitors
    io.to('monitors').emit('newRoom', getRoomDataForMonitor(roomId));
    
    console.log(`Room created: ${roomId}, Player color: ${color}`);
  });

  // Join an existing game room
  socket.on('joinRoom', ({ roomId }) => {
    // Check if room exists
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Phòng không tồn tại' });
      return;
    }
    
    const room = rooms.get(roomId);
    
    // Check if room is full
    if (Object.keys(room.players).length >= 2) {
      socket.emit('error', { message: 'Phòng đã đầy' });
      return;
    }
    
    // Determine the player's color (opposite of existing player)
    const existingPlayer = Object.values(room.players)[0];
    const color = existingPlayer.color === 'white' ? 'black' : 'white';
    
    // Add player to room
    room.players[socket.id] = {
      id: socket.id,
      color: color,
      ready: true
    };
    
    // Join the room
    socket.join(roomId);
    
    // Start the game
    room.gameStarted = true;
    
    // Notify both clients
    socket.emit('roomJoined', { roomId, color });
    io.to(roomId).emit('gameStarted');
    io.to(roomId).emit('startTimers');
    
    // Cập nhật cho monitor
    updateRoomForSpectators(roomId);
    broadcastActiveRooms();
    
    console.log(`Player joined room: ${roomId}, Player color: ${color}`);
  });

  // Handle player move
  socket.on('move', ({ roomId, board, turn, gameState, whiteTotal, blackTotal, whiteMove, blackMove, capturedPiece }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    
    // Update the board state and turn
    room.board = board;
    room.currentTurn = turn;
    
    // Update game state
    if (gameState) {
      room.gameState = {...room.gameState, ...gameState};
    }
    
    // Update timers
    room.timers = {
      whiteTotal,
      blackTotal,
      whiteMove,
      blackMove
    };
    
    // Handle captured pieces
    if (capturedPiece) {
      if (!room.gameState.capturedPieces) {
        room.gameState.capturedPieces = { white: [], black: [] };
      }
      
      const captureColor = capturedPiece.charAt(0) === capturedPiece.charAt(0).toUpperCase() ? 'black' : 'white';
      room.gameState.capturedPieces[captureColor].push(capturedPiece);
    }
    
    // Broadcast the updated board to all players in the room
    io.to(roomId).emit('updateBoard', { 
      board: room.board, 
      turn: room.currentTurn,
      gameState: room.gameState
    });
    
    // Broadcast timer updates
    io.to(roomId).emit('updateTimers', room.timers);
    
    // Cập nhật cho monitor
    updateRoomForSpectators(roomId);
    broadcastActiveRooms();
    
    // Check for game over conditions
    if (gameState && (gameState.checkmate || gameState.stalemate)) {
      let result;
      if (gameState.checkmate) {
        result = turn === 'white' ? 'black' : 'white'; // Opposite of current turn wins
      } else {
        result = 'draw';
      }
      
      io.to(roomId).emit('gameOver', result);
      room.gameStarted = false;
      
      // Cập nhật trạng thái phòng cho monitor
      updateRoomForSpectators(roomId);
      broadcastActiveRooms();
    }
  });

  // Xử lý tin nhắn trong phòng
  socket.on('sendMessage', ({ roomId, message, color, sender }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    let player = room.players[socket.id];
    let isSpectator = false;
    
    // Kiểm tra nếu người gửi là spectator
    if (!player) {
      // Kiểm tra xem socket này có phải là spectator của phòng không
      if (spectators.has(roomId) && spectators.get(roomId).has(socket.id)) {
        isSpectator = true;
      } else {
        return; // Không phải người chơi hoặc spectator trong phòng
      }
    }
    
    // Sử dụng sender từ client hoặc tạo ra dựa trên color và loại người dùng
    let senderName;
    if (isSpectator) {
      senderName = `Khán giả (${socket.id.substr(0, 4)})`;
      color = 'spectator';
    } else {
      senderName = sender || (color === 'white' ? 'Trắng' : 'Đen');
    }
    
    // Store message in room history
    if (!room.messages) {
      room.messages = [];
    }
    
    const messageObject = {
      sender: senderName,
      message,
      color
    };
    
    room.messages.push(messageObject);
    
    // Broadcast message to all players and spectators in the room
    io.to(roomId).emit('receiveMessage', messageObject);
    io.to(`spectator-${roomId}`).emit('receiveMessage', messageObject);
    
    // Cập nhật cho monitor
    updateRoomForSpectators(roomId);
  });

  // Handle game over
  socket.on('gameOver', ({ roomId, result }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    // Broadcast winner to all players
    io.to(roomId).emit('gameOver', result);
    
    // Update room state
    const room = rooms.get(roomId);
    room.gameStarted = false;
    
    // Cập nhật cho monitor
    updateRoomForSpectators(roomId);
    broadcastActiveRooms();
  });

  // Handle restart game request
  socket.on('readyToRestart', ({ roomId }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    
    // Mark player as ready
    if (room.players[socket.id]) {
      // Initialize readyToRestart property if it doesn't exist
      if (!room.readyToRestart) {
        room.readyToRestart = {};
      }
      
      room.readyToRestart[socket.id] = true;
      
      // Notify all players about this player being ready
      io.to(roomId).emit('playerReadyToRestart', { 
        playerId: socket.id 
      });
      
      // Check if all players are ready
      const allPlayers = Object.keys(room.players);
      const readyPlayers = Object.keys(room.readyToRestart || {});
      
      if (allPlayers.length === 2 && allPlayers.every(id => readyPlayers.includes(id))) {
        // Both players are ready, restart the game
        room.board = JSON.parse(JSON.stringify(initialBoardState));
        room.currentTurn = 'white';
        room.gameStarted = true;
        room.timers = {
          whiteTotal: 600,
          blackTotal: 600,
          whiteMove: 120,
          blackMove: 120
        };
        room.gameState = {
          whiteCastleKingSide: true,
          whiteCastleQueenSide: true,
          blackCastleKingSide: true,
          blackCastleQueenSide: true,
          enPassantTarget: null,
          halfMoveClock: 0,
          fullMoveNumber: 1,
          check: false,
          checkmate: false,
          stalemate: false,
          capturedPieces: {
            white: [],
            black: []
          }
        };
        
        // Reset messages array but keep previous messages
        if (!room.messages) {
          room.messages = [];
        }
        
        // Add system message about game restart
        room.messages.push({
          sender: 'Hệ thống',
          message: 'Trò chơi đã được khởi động lại',
          color: 'system'
        });
        
        // Clear ready flags
        room.readyToRestart = {};
        
        // Notify all players that both are ready and game is restarting
        io.to(roomId).emit('bothPlayersReady');
        io.to(roomId).emit('restartGame');
        io.to(roomId).emit('updateTimers', room.timers);
        io.to(roomId).emit('startTimers');
        
        // Cập nhật cho monitor
        updateRoomForSpectators(roomId);
        broadcastActiveRooms();
      } else {
        // Still waiting for the other player
        socket.emit('waitingForOpponent');
      }
    }
  });

  // Handle finding a random match
  socket.on('findRandomMatch', ({ preferredColor }) => {
    console.log(`Player ${socket.id} looking for random match, preferred color: ${preferredColor}`);
    
    let match = null;
    
    // Matching logic
    if (preferredColor === 'any') {
      // Player has no color preference
      
      // Check if there's a player waiting with a specific color
      if (waitingPlayers.white) {
        match = {
          player: waitingPlayers.white,
          playerColor: 'white',
          opponentColor: 'black'
        };
        waitingPlayers.white = null;
      } else if (waitingPlayers.black) {
        match = {
          player: waitingPlayers.black,
          playerColor: 'black',
          opponentColor: 'white'
        };
        waitingPlayers.black = null;
      } else if (waitingPlayers.any.length > 0) {
        // Match with another 'any' player and assign random colors
        const opponent = waitingPlayers.any.shift();
        const randomColor = Math.random() < 0.5 ? 'white' : 'black';
        
        match = {
          player: opponent,
          playerColor: randomColor === 'white' ? 'black' : 'white',
          opponentColor: randomColor
        };
      } else {
        // No one is waiting, add this player to the queue
        waitingPlayers.any.push(socket.id);
        socket.emit('waitingForMatch');
        return;
      }
    } else {
      // Player has a specific color preference (white or black)
      const oppositeColor = preferredColor === 'white' ? 'black' : 'white';
      
      // Check if there's a player waiting with the opposite color
      if (waitingPlayers[oppositeColor]) {
        match = {
          player: waitingPlayers[oppositeColor],
          playerColor: oppositeColor,
          opponentColor: preferredColor
        };
        waitingPlayers[oppositeColor] = null;
      } else if (waitingPlayers.any.length > 0) {
        // Match with an 'any' player
        const opponent = waitingPlayers.any.shift();
        
        match = {
          player: opponent,
          playerColor: oppositeColor,
          opponentColor: preferredColor
        };
      } else {
        // No suitable player waiting, add this player to the queue
        waitingPlayers[preferredColor] = socket.id;
        socket.emit('waitingForMatch');
        return;
      }
    }
    
    // If a match is found, create a room and pair them
    if (match) {
      const roomId = uuidv4().substring(0, 8);
      
      // Initialize a new room
      rooms.set(roomId, {
        players: {
          [socket.id]: {
            id: socket.id,
            color: match.opponentColor,
            ready: true
          },
          [match.player]: {
            id: match.player,
            color: match.playerColor,
            ready: true
          }
        },
        board: JSON.parse(JSON.stringify(initialBoardState)),
        currentTurn: 'white',
        gameStarted: true,
        messages: [],
        timers: {
          whiteTotal: 600,
          blackTotal: 600,
          whiteMove: 120,
          blackMove: 120
        },
        gameState: {
          whiteCastleKingSide: true,
          whiteCastleQueenSide: true,
          blackCastleKingSide: true,
          blackCastleQueenSide: true,
          enPassantTarget: null,
          halfMoveClock: 0,
          fullMoveNumber: 1,
          check: false,
          checkmate: false,
          stalemate: false,
          capturedPieces: {
            white: [],
            black: []
          }
        }
      });
      
      // Add both players to the room
      socket.join(roomId);
      io.sockets.sockets.get(match.player)?.join(roomId);
      
      // Notify both players
      socket.emit('matchFound', { roomId, color: match.opponentColor });
      io.to(match.player).emit('matchFound', { roomId, color: match.playerColor });
      
      // Start the game
      io.to(roomId).emit('gameStarted');
      io.to(roomId).emit('startTimers');
      
      // Thông báo cho monitor về phòng mới
      broadcastActiveRooms();
      
      console.log(`Random match created: ${roomId}, Players: ${socket.id}(${match.opponentColor}) and ${match.player}(${match.playerColor})`);
    }
  });
  
  // Handle canceling match finding
  socket.on('cancelFindMatch', () => {
    // Remove player from all waiting lists
    if (waitingPlayers.white === socket.id) {
      waitingPlayers.white = null;
    }
    
    if (waitingPlayers.black === socket.id) {
      waitingPlayers.black = null;
    }
    
    const anyIndex = waitingPlayers.any.indexOf(socket.id);
    if (anyIndex !== -1) {
      waitingPlayers.any.splice(anyIndex, 1);
    }
    
    socket.emit('matchCancelled');
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove player from matching queues
    if (waitingPlayers.white === socket.id) {
      waitingPlayers.white = null;
    }
    
    if (waitingPlayers.black === socket.id) {
      waitingPlayers.black = null;
    }
    
    const anyIndex = waitingPlayers.any.indexOf(socket.id);
    if (anyIndex !== -1) {
      waitingPlayers.any.splice(anyIndex, 1);
    }
    
    // Kiểm tra và xóa spectator khỏi các phòng
    for (const [roomId, spectatorSet] of spectators.entries()) {
      if (spectatorSet.has(socket.id)) {
        spectatorSet.delete(socket.id);
        if (spectatorSet.size === 0) {
          spectators.delete(roomId);
        }
      }
    }
    
    // Remove from monitors list if applicable
    socket.leave('monitors');
    
    // Find and handle rooms where this player was
    for (const [roomId, room] of rooms.entries()) {
      if (room.players[socket.id]) {
        // Remove player from the room
        delete room.players[socket.id];
        
        // Add system message about player leaving
        if (!room.messages) {
          room.messages = [];
        }
        const playerColor = room.players[socket.id]?.color || 'unknown';
        room.messages.push({
          sender: 'Hệ thống',
          message: `Người chơi ${playerColor === 'white' ? 'Trắng' : 'Đen'} đã rời phòng`,
          color: 'system'
        });
        
        // Remove from readyToRestart if exists
        if (room.readyToRestart && room.readyToRestart[socket.id]) {
          delete room.readyToRestart[socket.id];
        }
        
        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
          // Thông báo cho monitors rằng phòng đã đóng
          io.to('monitors').emit('roomClosed', roomId);
          
          // Thông báo cho spectators
          io.to(`spectator-${roomId}`).emit('roomClosed', {
            message: 'Phòng đã được đóng'
          });
          
          rooms.delete(roomId);
          console.log(`Room deleted: ${roomId}`);
        } else {
          // Notify remaining player
          io.to(roomId).emit('playerDisconnected', {
            message: 'Đối thủ đã rời phòng'
          });
          
          // Game is paused when a player disconnects
          room.gameStarted = false;
          
          // Cập nhật cho monitors
          updateRoomForSpectators(roomId);
          broadcastActiveRooms();
        }
      }
    }
  });
  
  // Xử lý cập nhật timer định kỳ từ client
  socket.on('updateRoomTimers', ({ roomId, whiteTotal, blackTotal, whiteMove, blackMove }) => {
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    room.timers = {
      whiteTotal,
      blackTotal,
      whiteMove,
      blackMove
    };
    
    // Cập nhật timers cho spectators nhưng không broadcast đến players (họ đã có đồng hồ local)
    io.to(`spectator-${roomId}`).emit('timerUpdated', room.timers);
  });
});

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('Chess Server is running!');
});

// Endpoint to get all active rooms (RESTful API)
app.get('/api/rooms', (req, res) => {
  const activeRooms = [];
  for (const [roomId, room] of rooms.entries()) {
    activeRooms.push(getRoomDataForMonitor(roomId));
  }
  res.json(activeRooms);
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});