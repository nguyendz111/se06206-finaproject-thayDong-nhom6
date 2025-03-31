import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import hình ảnh từ thư mục assets/images
import chessboardImage from "../assets/images/chessboard.png";
import kingMoveImage from "../assets/images/king-move.png";
import queenMoveImage from "../assets/images/queen-move.png";
import rookMoveImage from "../assets/images/rook-move.png";
import bishopMoveImage from "../assets/images/bishop-move.png";
import knightMoveImage from "../assets/images/knight-move.png";
import pawnMoveImage from "../assets/images/pawn-move.png";

const lessons = {
  Beginner: [
    {
      title: "Introduction to the Chessboard and Pieces",
      content: `The Chessboard Setup
The chessboard consists of 64 squares (8x8 grid), alternating between light and dark colors.

Key Points about the Chessboard:
- The **bottom-right square must be light.
- The board is labeled using files (a-h) and ranks (1-8).
- White starts the game.
  
Chess Pieces and Their Initial Positions:
- Each player starts with 16 pieces:  
  - 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, 8 Pawns.
- Piece Placement:  
  - Rooks in the corners.  
  - Knights next to the rooks.  
  - Bishops next to the knights.  
  - Queen on her color (White Queen on white square, Black Queen on black square).  
  - King next to the queen.  
  - Pawns occupy the entire second rank.  
`,
      image: chessboardImage,
    },
    {
      title: "How Chess Pieces Move",
      content: `How Each Piece Moves`,
      subLessons: [
        { name: "King", description: "Moves one square in any direction.", image: kingMoveImage },
        { name: "Queen", description: "Moves any number of squares in any direction.", image: queenMoveImage },
        { name: "Rook", description: "Moves any number of squares horizontally or vertically.", image: rookMoveImage },
        { name: "Bishop", description: "Moves diagonally any number of squares.", image: bishopMoveImage },
        { name: "Knight", description: "Moves in an L-shape.", image: knightMoveImage },
        { name: "Pawn", description: "Moves forward one square, captures diagonally.", image: pawnMoveImage },
      ],
    },
    {
      title: "Basic Chess Concepts",
      content: `1. Objective of Chess
The goal in chess is to checkmate your opponent’s king. Checkmate happens when the king is under attack and cannot escape.

2. Chess Notation
Chess moves are recorded using algebraic notation, where:
- Each file (column) is labeled a-h.
- Each rank (row) is labeled 1-8.
- Example move: e4 means moving a piece to e4.

3. Piece Values
Each piece has a general point value:
- Pawn = 1
- Knight = 3
- Bishop = 3
- Rook = 5
- Queen = 9
- King = Priceless (cannot be lost)

4. Control the Center
- The center squares (d4, d5, e4, e5) are the most important.
- Placing pawns and pieces here gives you more mobility.

5. Basic Opening Principles
- Control the center early (e4, d4, c4, or Nf3).
- Develop knights and bishops before moving the queen.
- Castle early to protect the king.
- Avoid moving the same piece multiple times in the opening.
`,
    },
  ],
};

const LessonsPage = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [activeLesson, setActiveLesson] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar ngang */}
      <div className="w-full bg-red-700 text-white flex justify-between items-center p-4 fixed top-0 left-0 z-10">
        <button onClick={() => navigate("/")} className="text-lg font-bold hover:bg-red-600 p-2 rounded-md">
          ⬅ Home
        </button>
        <div className="flex space-x-4">
          {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
            <button
              key={level}
              className={`p-2 rounded-md transition ${
                selectedLevel === level ? "bg-white text-red-700 font-bold" : "hover:bg-red-600"
              }`}
              onClick={() => {
                setSelectedLevel(level);
                setActiveLesson(null);
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Nội dung bài học */}
      <div className="pt-20 p-6">
        <h1 className="text-3xl font-bold text-red-700 text-center mb-6">Chess Lessons</h1>

        {lessons[selectedLevel]?.map((lesson, index) => (
          <div key={index} className="mb-4">
            <button
              className="w-full text-left p-3 bg-gray-300 rounded-lg shadow hover:bg-gray-400 transition duration-200"
              onClick={() => setActiveLesson(activeLesson === index ? null : index)}
            >
              {lesson.title}
            </button>

            {activeLesson === index && (
              <div className="mt-2 p-4 bg-white border-l-4 border-red-600 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{lesson.content}</p>

                {lesson.image && (
                  <div className="mt-4 flex justify-center">
                    <img src={lesson.image} alt="Chessboard" className="w-full max-w-md border rounded-lg" />
                  </div>
                )}

                {lesson.subLessons &&
                  lesson.subLessons.map((sub, subIndex) => (
                    <div key={subIndex} className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <h3 className="text-lg font-bold">{sub.name}</h3>
                      <p className="text-gray-700">{sub.description}</p>
                      {sub.image && (
                        <div className="mt-2 flex justify-center">
                          <img src={sub.image} alt={sub.name} className="w-full max-w-md border rounded-lg" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsPage;
