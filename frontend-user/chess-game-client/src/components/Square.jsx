import React, { useState } from "react";
import pieceImages from "../assets/pieceImages";

const Square = ({ row, col, piece, isBlack, isHighlighted, isKingInCheck, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Định nghĩa các style cho ô
  const squareStyle = {
    width: "60px",
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isKingInCheck
      ? "red" // Màu đỏ khi vua bị chiếu
      : isHighlighted
      ? "yellow" // Màu highlight nếu ô được chọn
      : isBlack
      ? isHovered
        ? "#8ba769" // Sáng hơn khi hover (ô đen)
        : "#769656"
      : isHovered
      ? "#f0f0f0" // Sáng hơn khi hover (ô trắng)
      : "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease", // Hiệu ứng chuyển màu mượt mà
  };

  // Style cho quân cờ
  const pieceStyle = {
    width: "100%",
    height: "100%",
  };

  return (
    <div
      style={squareStyle}
      onClick={() => onClick(row, col)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {piece && <img src={pieceImages[piece]} alt={piece} style={pieceStyle} />}
    </div>
  );
};

export default Square;