import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, Users, Trophy, X, ChevronLeft, MessageSquare } from 'lucide-react';

// Khởi tạo kết nối socket
const ENDPOINT = 'http://localhost:4000'; // Thay thế bằng URL server của bạn
const socket = io(ENDPOINT);

const ChessMonitor = () => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kết nối và lấy danh sách phòng khi component mount
    socket.emit('getActiveRooms');

    socket.on('activeRoomsList', (rooms) => {
      setActiveRooms(rooms);
      setLoading(false);
    });

    socket.on('roomUpdated', (updatedRoom) => {
      setActiveRooms(prev => {
        const roomIndex = prev.findIndex(room => room.id === updatedRoom.id);
        if (roomIndex !== -1) {
          const newRooms = [...prev];
          newRooms[roomIndex] = updatedRoom;
          return newRooms;
        }
        return [...prev, updatedRoom];
      });
      
      // Cập nhật thông tin phòng đang xem nếu là phòng đó
      if (selectedRoom && selectedRoom.id === updatedRoom.id) {
        setSelectedRoom(updatedRoom);
      }
    });

    socket.on('roomClosed', (roomId) => {
      setActiveRooms(prev => prev.filter(room => room.id !== roomId));
      if (selectedRoom && selectedRoom.id === roomId) {
        setSelectedRoom(null);
      }
    });

    socket.on('newRoom', (room) => {
      setActiveRooms(prev => [...prev, room]);
    });

    socket.on('error', (err) => {
      setError(err.message);
      setLoading(false);
    });

    // Cleanup listener khi component unmount
    return () => {
      socket.off('activeRoomsList');
      socket.off('roomUpdated');
      socket.off('roomClosed');
      socket.off('newRoom');
      socket.off('error');
    };
  }, [selectedRoom]);

  // Hàm tham gia vào phòng để xem trận đấu
  const joinAsSpectator = (roomId) => {
    socket.emit('joinAsSpectator', { roomId });
    socket.on('spectatorJoined', (roomData) => {
      setSelectedRoom(roomData);
    });
  };

  // Format thời gian từ giây sang mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chuyển đổi tên quân cờ thành biểu tượng Unicode
  const getPieceSymbol = (piece) => {
    if (!piece) return null;
    
    const symbols = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    
    return symbols[piece] || piece;
  };

  // Xác định màu sắc cho quân cờ
  const getPieceColor = (piece) => {
    if (!piece) return '';
    return piece === piece.toUpperCase() ? 'text-blue-600' : 'text-red-600';
  };

  // Hiển thị ký hiệu file (a-h) và rank (1-8) cho bàn cờ
  const getFileLabel = (index) => {
    return String.fromCharCode(97 + index); // 'a' + index
  };

  const getRankLabel = (index) => {
    return 8 - index; // Rank từ 8 đến 1
  };

  // Hiển thị bàn cờ trong chế độ xem
  const renderChessboard = (board) => {
    if (!board) return null;
    
    // Xác định bàn cờ hiển thị theo góc nhìn (quân trắng ở dưới)
    const displayBoard = [...board];
    
    return (
      <div className="w-full max-w-md mx-auto border-2 border-gray-800 relative">
        {/* Rank labels (8-1) bên trái */}
        <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-sm font-medium">
          {Array(8).fill().map((_, index) => (
            <div key={`rank-left-${index}`} className="flex items-center justify-center h-full">
              {getRankLabel(index)}
            </div>
          ))}
        </div>

        {/* Rank labels (8-1) bên phải */}
        <div className="absolute -right-6 top-0 bottom-0 flex flex-col justify-around text-sm font-medium">
          {Array(8).fill().map((_, index) => (
            <div key={`rank-right-${index}`} className="flex items-center justify-center h-full">
              {getRankLabel(index)}
            </div>
          ))}
        </div>
        
        {/* Bàn cờ chính */}
        <div>
          {displayBoard.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex">
              {row.map((piece, colIndex) => {
                const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
                return (
                  <div 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`aspect-square w-full flex items-center justify-center text-2xl 
                    ${isBlackSquare ? 'bg-gray-700' : 'bg-amber-100'} 
                    relative`}
                  >
                    <span className={getPieceColor(piece)}>
                      {getPieceSymbol(piece)}
                    </span>
                    
                    {/* Hiển thị tọa độ ô ở góc dưới phải */}
                    {(rowIndex === 7 || colIndex === 0) && (
                      <span className="absolute text-xs bottom-0 right-0 m-1 opacity-50">
                        {getFileLabel(colIndex)}{getRankLabel(rowIndex)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* File labels (a-h) bên dưới */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-around text-sm font-medium">
          {Array(8).fill().map((_, index) => (
            <div key={`file-bottom-${index}`} className="flex items-center justify-center w-full">
              {getFileLabel(index)}
            </div>
          ))}
        </div>
        
        {/* File labels (a-h) bên trên */}
        <div className="absolute -top-6 left-0 right-0 flex justify-around text-sm font-medium">
          {Array(8).fill().map((_, index) => (
            <div key={`file-top-${index}`} className="flex items-center justify-center w-full">
              {getFileLabel(index)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Hiển thị nước đi trước đó
  const renderMoveHistory = (moves) => {
    if (!moves || moves.length === 0) return null;
    
    return (
      <div className="mt-4 overflow-y-auto max-h-40 border rounded p-2">
        <h3 className="font-medium mb-2">Lịch sử nước đi</h3>
        <div className="grid grid-cols-2 gap-2">
          {moves.map((move, idx) => (
            <div key={`move-${idx}`} className={`text-sm ${idx % 2 === 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {idx % 2 === 0 && <span className="text-gray-500 mr-1">{Math.floor(idx/2) + 1}.</span>}
              {move}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Danh sách quân bị bắt
  const renderCapturedPieces = (capturedPieces) => {
    if (!capturedPieces) return null;
    
    return (
      <div className="mt-4 bg-gray-50 p-3 rounded">
        <h3 className="font-medium mb-2">Quân bị bắt</h3>
        <div className="flex space-x-2 mb-2">
          <span className="font-medium">Trắng:</span>
          <div className="flex space-x-1">
            {capturedPieces.white.map((piece, idx) => (
              <span key={`white-captured-${idx}`} className="text-red-600">
                {getPieceSymbol(piece)}
              </span>
            ))}
            {capturedPieces.white.length === 0 && <span className="text-gray-500">Không có</span>}
          </div>
        </div>
        <div className="flex space-x-2">
          <span className="font-medium">Đen:</span>
          <div className="flex space-x-1">
            {capturedPieces.black.map((piece, idx) => (
              <span key={`black-captured-${idx}`} className="text-blue-600">
                {getPieceSymbol(piece)}
              </span>
            ))}
            {capturedPieces.black.length === 0 && <span className="text-gray-500">Không có</span>}
          </div>
        </div>
      </div>
    );
  };

  // Tin nhắn trong phòng
  const renderChatMessages = (messages) => {
    if (!messages || messages.length === 0) return (
      <div className="p-4 text-center text-gray-500">
        Chưa có tin nhắn nào
      </div>
    );
    
    return (
      <div className="overflow-y-auto max-h-80 p-2">
        {messages.map((msg, idx) => (
          <div key={`msg-${idx}`} className="mb-2">
            <span className={`font-medium ${msg.color === 'white' ? 'text-blue-600' : 'text-red-600'}`}>
              {msg.sender}:
            </span>
            <span className="ml-2">{msg.message}</span>
          </div>
        ))}
      </div>
    );
  };

  // UI cho chế độ xem chi tiết phòng
  const renderRoomDetail = () => {
    if (!selectedRoom) return null;
    
    const { id, players, board, currentTurn, timers, gameState, messages, moves } = selectedRoom;
    const playerWhite = Object.values(players).find(p => p.color === 'white');
    const playerBlack = Object.values(players).find(p => p.color === 'black');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <button 
                onClick={() => setSelectedRoom(null)}
                className="mr-2 rounded-full p-1 hover:bg-gray-200"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-bold">Phòng: {id}</h2>
            </div>
            <button 
              onClick={() => setSelectedRoom(null)}
              className="rounded-full p-1 hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              {/* Thông tin người chơi đen */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${currentTurn === 'black' ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                  <span className="font-semibold">Người chơi Đen</span>
                  <span className="text-gray-500">({playerBlack ? `ID: ${playerBlack.id.substring(0, 6)}...` : 'Đang chờ...'})</span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded">
                  <Clock className="inline mr-1" size={16} />
                  {formatTime(timers.blackTotal)}
                </div>
              </div>
              
              {/* Bàn cờ đã cải tiến */}

              <div className="mb-8 mt-8 pt-8 pb-8 relative">
                {renderChessboard(board)}
              </div>
              
              {/* Thông tin người chơi trắng */}
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${currentTurn === 'white' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <span className="font-semibold">Người chơi Trắng</span>
                  <span className="text-gray-500">({playerWhite ? `ID: ${playerWhite.id.substring(0, 6)}...` : 'Đang chờ...'})</span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded">
                  <Clock className="inline mr-1" size={16} />
                  {formatTime(timers.whiteTotal)}
                </div>
              </div>
              
              {/* Thông tin trạng thái */}
              <div className="mt-4">
                <div className="bg-gray-100 p-3 rounded">
                  <p><span className="font-medium">Lượt đi:</span> {currentTurn === 'white' ? 'Trắng' : 'Đen'}</p>
                  <p><span className="font-medium">Số nước đi:</span> {gameState?.fullMoveNumber || 1}</p>
                  {gameState?.check && <p className="text-red-600 font-medium">Đang bị chiếu!</p>}
                  {gameState?.checkmate && <p className="text-red-600 font-bold">Chiếu bí! {currentTurn === 'white' ? 'Đen' : 'Trắng'} thắng</p>}
                  {gameState?.stalemate && <p className="text-orange-600 font-bold">Hòa cờ!</p>}
                </div>
              </div>
              
              {/* Quân bị bắt */}
              {gameState && renderCapturedPieces(gameState.capturedPieces)}
              
              {/* Lịch sử nước đi */}
              {renderMoveHistory(moves)}
            </div>
            
            <div className="md:col-span-1 border rounded">
              <div className="bg-gray-100 p-2 border-b flex items-center">
                <MessageSquare size={18} className="mr-2" />
                <h3 className="font-semibold">Tin nhắn trò chơi</h3>
              </div>
              {renderChatMessages(messages)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // UI chính - danh sách phòng
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Trophy className="mr-2" /> Theo dõi các trận đấu cờ
      </h1>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Đang tải danh sách phòng...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      ) : activeRooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2">Không có trận đấu nào đang diễn ra</h3>
          <p className="text-gray-500">Các trận đấu cờ sẽ xuất hiện ở đây khi người chơi tạo phòng mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRooms.map(room => {
            const playerWhite = Object.values(room.players).find(p => p.color === 'white');
            const playerBlack = Object.values(room.players).find(p => p.color === 'black');
            const gameStatus = room.gameState?.checkmate ? 'Kết thúc' : room.gameState?.stalemate ? 'Hòa' : room.gameStarted ? 'Đang chơi' : 'Đang chờ';
            
            return (
              <div key={room.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Phòng: {room.id}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gameStatus === 'Đang chơi' ? 'bg-green-100 text-green-800' :
                    gameStatus === 'Kết thúc' ? 'bg-red-100 text-red-800' :
                    gameStatus === 'Hòa' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {gameStatus}
                  </span>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span>Trắng:</span>
                      </div>
                      <span className="text-gray-600 text-sm">
                        {playerWhite ? `ID: ${playerWhite.id.substring(0, 6)}...` : 'Đang chờ...'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span>Đen:</span>
                      </div>
                      <span className="text-gray-600 text-sm">
                        {playerBlack ? `ID: ${playerBlack.id.substring(0, 6)}...` : 'Đang chờ...'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <div>
                      <Clock className="inline mr-1" size={14} />
                      {formatTime(room.timers.whiteTotal)} / {formatTime(room.timers.blackTotal)}
                    </div>
                    <div>
                      Lượt: {room.currentTurn === 'white' ? 'Trắng' : 'Đen'}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => joinAsSpectator(room.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center"
                  >
                    <Eye size={18} className="mr-2" />
                    Xem trận đấu
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {selectedRoom && renderRoomDetail()}
    </div>
  );
};

export default ChessMonitor;