import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const lessons = {
  Beginner: [
    {
      title: "Introduction to the Chessboard and Pieces",
      content: `The chessboard consists of 64 squares, alternating between light and dark colors.\n
      - Each player has 16 pieces: 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, and 8 Pawns.\n
      - The board is set up so that each player has a light square on their right corner.`,
    },
    {
      title: "How Chess Pieces Move",
      content: `Each piece moves uniquely:\n
      - **King**: Moves one square in any direction.\n
      - **Queen**: Moves any number of squares in any direction.\n
      - **Rook**: Moves any number of squares horizontally or vertically.\n
      - **Bishop**: Moves diagonally any number of squares.\n
      - **Knight**: Moves in an L-shape: two squares in one direction, then one square perpendicular.\n
      - **Pawn**: Moves forward one square (two squares on its first move), captures diagonally.`,
    },
    {
      title: "Basic Chess Rules",
      content: `- **Checkmate**: The game ends when a King is attacked and cannot escape.\n
      - **Castling**: A special move involving the King and Rook for safety.\n
      - **Pawn Promotion**: A Pawn reaching the last rank can be promoted to a stronger piece.\n
      - **En Passant**: A unique pawn capture rule that occurs in special conditions.`,
    },
  ],

  Intermediate: [
    {
      title: "Intermediate Chess Tactics",
      content: `Learn essential tactical patterns:\n
      - **Skewer**: Attack two pieces in a line, forcing the more valuable one to move.\n
      - **Discovered Attack**: A hidden attack is revealed when another piece moves.\n
      - **Removing the Defender**: Eliminating a key defending piece to gain an advantage.`,
    },
    {
      title: "Popular Openings for Intermediate Players",
      content: `Understand the meaning behind each move:\n
      - **Ruy-Lopez**: Classical opening with early center control.\n
      - **Sicilian Defense**: Aggressive counterplay against 1.e4.\n
      - **London System**: A solid, flexible opening for White.`,
    },
    {
      title: "Key Attacks in Chess",
      content: `Master attacking techniques:\n
      - **Checkmating with Two Rooks**: Coordinating rooks for an unstoppable mate.\n
      - **King & Rook vs. King**: The basic checkmate pattern.\n
      - **King & Pawn vs. King**: Winning pawn endgames efficiently.`,
    },
  ],

  Advanced: [
    {
      title: "Advanced Opening Strategies",
      content: `Deep dive into advanced openings:\n
      - **Sicilian Najdorf**: Sharp, aggressive counterplay for Black.\n
      - **King’s Indian Defense**: A dynamic opening with attacking chances.\n
      - **Gambit Play**: Sacrificing material for long-term compensation.`,
    },
    {
      title: "Advanced Tactical Patterns",
      content: `Take your tactics to the next level:\n
      - **Sacrifices**: When to give up material for greater advantages.\n
      - **King Hunting**: Forcing the enemy King into a vulnerable position.\n
      - **Zugzwang**: Creating a position where any move worsens the opponent’s position.`,
    },
    {
      title: "Complex Endgames",
      content: `Endgame techniques that separate experts from amateurs:\n
      - **King + Rook vs. King + Pawn**: When the game is drawn and when it’s won.\n
      - **50-Move Rule**: Surviving long, difficult endgames.\n
      - **Triangulation & Opposition**: Outplaying your opponent in King & Pawn endgames.`,
    },
  ],
};

const LessonsPage = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  const toggleLevel = (level) => {
    setActiveLevel(activeLevel === level ? null : level);
    setActiveLesson(null);
  };

  const toggleLesson = (index) => {
    setActiveLesson(activeLesson === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-red-700 mb-6 text-center">Chess Lessons</h1>

        {/* LEVEL SELECTION */}
        {Object.keys(lessons).map((level, levelIndex) => (
          <div key={levelIndex} className="mb-6">
            <button
              className="w-full text-left p-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-200"
              onClick={() => toggleLevel(level)}
            >
              {level}
            </button>

            {/* SHOW LESSONS IF LEVEL IS ACTIVE */}
            {activeLevel === level && (
              <div className="mt-2 p-4 bg-gray-200 rounded-lg">
                {lessons[level].map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="mb-4">
                    <button
                      className="w-full text-left p-3 bg-gray-300 rounded-lg shadow hover:bg-gray-400 transition duration-200"
                      onClick={() => toggleLesson(lessonIndex)}
                    >
                      {lesson.title}
                    </button>
                    {activeLesson === lessonIndex && (
                      <div className="mt-2 p-4 bg-white border-l-4 border-red-600 rounded-lg whitespace-pre-line">
                        <p className="text-gray-700">{lesson.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 w-full"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LessonsPage;
