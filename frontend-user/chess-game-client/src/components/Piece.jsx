// Piece.js
import pieceImages from "../assets/pieceImages";

export const getPieceImage = (piece) => {
  return piece ? pieceImages[piece] : null;
};
