import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStompClient } from "../apis/api_socket";
import { getPossibleMovesForPiece } from "../utils/chessLogic";
import Square from "./Square";
import "../style/Board.css";

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

const BoardOnline = () => {
  const { roomId } = useParams();
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState("w");
  const [playerColor, setPlayerColor] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  useEffect(() => {
    const stompClient = getStompClient(handleGameUpdates);
    console.log("WebSocket client initialized:", stompClient?.connected ? "Connected" : "Not connected");

    if (!stompClient || !stompClient.connected) {
      console.error("⚠️ WebSocket is not connected.");
      return;
    }

    // Gửi yêu cầu tham gia phòng
    stompClient.publish({
      destination: "/app/join-room",
      body: JSON.stringify({ roomId }),
    });

    // Đăng ký lắng nghe các update từ server (đúng channel)
    stompClient.subscribe(`/topic/chess-updates`, (message) => {
      const payload = JSON.parse(message.body);
      handleGameUpdates(payload, stompClient); // gửi cả stompClient để dùng nếu cần
    });

    return () => {
      stompClient.publish({
        destination: "/app/leave-room",
        body: JSON.stringify({ roomId }),
      });
    };
  }, [roomId]);

  const handleGameUpdates = (message, stompClient) => {
    console.log("📩 Received WebSocket message:", message);

    switch (message.type) {
      case "game-state":
        setBoard(message.board);
        setTurn(message.turn);
        break;

      case "assign-color":
      case "room-joined":
        setPlayerColor(message.color);
        console.log("🎨 Player color assigned:", message.color);
        break;

      case "opponent-move":
        setBoard((prevBoard) => {
          const newBoard = prevBoard.map((row) => [...row]);
          newBoard[message.to[0]][message.to[1]] = newBoard[message.from[0]][message.from[1]];
          newBoard[message.from[0]][message.from[1]] = "";
          return newBoard;
        });
        setTurn((prevTurn) => (prevTurn === "w" ? "b" : "w"));
        break;

      case "start-game":
        console.log("🚀 Game started!");
        alert("🎉 Game is starting!");
        break;

      case "room-created":
        // Nếu bạn dùng create-room ở component khác, auto join-room sau khi tạo
        console.log("✅ Room created:", message.roomId);
        stompClient?.publish({
          destination: "/app/join-room",
          body: JSON.stringify({ roomId: message.roomId }),
        });
        break;

      case "error":
        alert(`❌ ${message.message}`);
        break;

      default:
        console.warn("⚠️ Unknown message type:", message.type);
    }
  };

  const handleSquareClick = (row, col) => {
    console.log("Square clicked:", { row, col, piece: board[row][col], turn, playerColor });
    if (playerColor !== turn) {
      console.log("Not your turn! Player color:", playerColor, "Current turn:", turn);
      return;
    }

    const piece = board[row][col];

    if (selectedPiece) {
      console.log("Attempting to move piece from", selectedPosition, "to", [row, col]);
      handleMove(row, col);
    } else if (piece && piece.endsWith(`_${playerColor}`)) {
      console.log("Piece selected:", piece, "at position:", [row, col]);
      setSelectedPiece(piece);
      setSelectedPosition([row, col]);
      const moves = getPossibleMovesForPiece(board, [row, col], piece);
      console.log("Possible moves calculated:", moves);
      setPossibleMoves(moves);
    }
  };

  const handleMove = (row, col) => {
    if (!selectedPiece || !selectedPosition) return;

    const possibleMoves = getPossibleMovesForPiece(board, selectedPosition, selectedPiece);
    const isValidMove = possibleMoves.some(move => move[0] === row && move[1] === col);

    if (!isValidMove) {
      alert("⚠️ Invalid move!");
      return;
    }

    const stompClient = getStompClient();
    if (!stompClient || !stompClient.connected) {
      alert("⚠️ WebSocket is not connected.");
      return;
    }

    stompClient.publish({
      destination: "/app/validate-move",
      body: JSON.stringify({
        roomId,
        from: selectedPosition,
        to: [row, col],
        selectedPiece,
      }),
    });

    stompClient.subscribe(`/topic/validate-move/${roomId}`, (responseMessage) => {
      const response = JSON.parse(responseMessage.body);
      if (response.isValid) {
        setBoard((prevBoard) => {
          const newBoard = prevBoard.map((row) => [...row]);
          newBoard[row][col] = newBoard[selectedPosition[0]][selectedPosition[1]];
          newBoard[selectedPosition[0]][selectedPosition[1]] = "";
          return newBoard;
        });
        setTurn((prevTurn) => (prevTurn === "w" ? "b" : "w"));
        setSelectedPiece(null);
        setSelectedPosition(null);
        setPossibleMoves([]);

        stompClient.publish({
          destination: "/app/move",
          body: JSON.stringify({ roomId, from: selectedPosition, to: [row, col] }),
        });
      } else {
        alert("⚠️ Server rejected move!");
      }
    });
  };

  return (
    <div className="game-container">
      <h2>Multiplayer Chess - Room: {roomId}</h2>
      <h3>Your color: {playerColor === "w" ? "White" : playerColor === "b" ? "Black" : "Waiting..."}</h3>
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
                isHighlighted={
                  (selectedPosition && selectedPosition[0] === rowIndex && selectedPosition[1] === colIndex) ||
                  possibleMoves.some(move => move[0] === rowIndex && move[1] === colIndex)
                }
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardOnline;
