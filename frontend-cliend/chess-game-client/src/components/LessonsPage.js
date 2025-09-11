import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import chessboardImage from '../images/chessboard.png';
import kingMoveImage from '../images/king-move.png';
import queenMoveImage from '../images/queen-move.png';
import rookMoveImage from '../images/rook-move.png';
import bishopMoveImage from '../images/bishop-move.png';
import knightMoveImage from '../images/knight-move.png';
import pawnMoveImage from '../images/pawn-move.png';

const lessons = {
  Beginner: [
    {
      title: 'Introduction to the Chessboard and Pieces',
      content: `
The Chessboard Setup:
The chessboard consists of 64 squares (8x8 grid), alternating between light and dark colors.

Key Points about the Chessboard:
- The **bottom-right square** must be light.
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
      title: 'How Chess Pieces Move',
      content: 'How Each Piece Moves',
      subLessons: [
        { name: 'King', description: 'Moves one square in any direction.', image: kingMoveImage },
        { name: 'Queen', description: 'Moves any number of squares in any direction.', image: queenMoveImage },
        { name: 'Rook', description: 'Moves any number of squares horizontally or vertically.', image: rookMoveImage },
        { name: 'Bishop', description: 'Moves diagonally any number of squares.', image: bishopMoveImage },
        { name: 'Knight', description: 'Moves in an L-shape.', image: knightMoveImage },
        { name: 'Pawn', description: 'Moves forward one square, captures diagonally.', image: pawnMoveImage },
      ],
    },
    {
      title: 'Basic Chess Concepts',
      content: `
1. **Objective of Chess**  
   The goal in chess is to checkmate your opponent’s king. Checkmate happens when the king is under attack and cannot escape.

2. **Chess Notation**  
   Chess moves are recorded using algebraic notation, where:  
   - Each file (column) is labeled a-h.  
   - Each rank (row) is labeled 1-8.  
   - Example move: e4 means moving a piece to e4.

3. **Piece Values**  
   Each piece has a general point value:  
   - Pawn = 1  
   - Knight = 3  
   - Bishop = 3  
   - Rook = 5  
   - Queen = 9  
   - King = Priceless (cannot be lost)

4. **Control the Center**  
   - The center squares (d4, d5, e4, e5) are the most important.  
   - Placing pawns and pieces here gives you more mobility.

5. **Basic Opening Principles**  
   - Control the center early (e4, d4, c4, or Nf3).  
   - Develop knights and bishops before moving the queen.  
   - Castle early to protect the king.  
   - Avoid moving the same piece multiple times in the opening.
      `,
    },
  ],
  Intermediate: [
    {
      title: 'Tactical Motifs in Chess',
      content: `Common tactical patterns help players gain an advantage:

1. Forks:
- A single piece attacks two or more enemy pieces at the same time.
- Knights are great at executing forks.

2. Pins:
- A piece is unable to move without exposing a more valuable piece behind it.
- Bishops, rooks, and queens often create pins.

3. Skewers:
- Similar to pins, but the more valuable piece is in front.
- The opponent is forced to move the valuable piece, exposing the less valuable one.

4. Discovered Attacks:
- Moving one piece reveals an attack by another.
- A discovered check is especially powerful.

5. Double Attacks:
- A move that threatens two things at once.
- Often leads to winning material or a checkmate.

6. Deflection and Decoy:
- Forcing an opponent's piece away from a key square.
`,
    },
    {
      title: 'Positional Play',
      content: `Unlike tactics, positional play focuses on long-term advantages.

1. Piece Activity:
- Knights and bishops should be placed where they control many squares.
- Avoid placing pieces where they have no mobility.

2. Pawn Structure:
- Double, isolated, or backward pawns can become weaknesses.
- Connected pawns are stronger.

3. Open Files and Diagonals:
- Rooks and queens become stronger when placed on open files.
- Bishops dominate long diagonals.

4. King Safety:
- Castling is a must in most games.
- Always be mindful of opponent's threats to your king.

5. Space Control:
- Having more space allows for better maneuvering.
- Controlling the center gives you more space to move.
`,
    },
  ],
  Advanced: [
    {
      title: 'Endgame Fundamentals',
      content: `Mastering the endgame is crucial for winning close games.

1. King Activity:
- The king is a powerful piece in the endgame.
- Move your king toward the center to control key squares.

2. Opposition:
- When kings face each other with one square in between, the player not moving has an advantage.
- Use opposition to force your opponent back.

3. Pawn Promotion:
- Pushing a passed pawn (one with no enemy pawns blocking it) is key.
- Support it with your king and other pieces.

4. Basic Checkmates:
- King + Queen vs. King: Use your queen to cut off escape squares and force the enemy king to the edge.
- King + Rook vs. King: Use the "box method" to limit the enemy king's movement.

5. Triangulation:
- A technique where the king moves in a triangle to pass the move to the opponent.
- Useful in king and pawn endgames.
`,
    },
    {
      title: 'Advanced Opening Concepts',
      content: `Beyond basic openings, advanced players focus on subtle improvements.

1. Pawn Breaks:
- Used to open lines for pieces or create weaknesses in the opponent's position.
- Example: d4-d5 in many openings.

2. Opening Theory:
- Understanding main variations of openings and their typical middle-game plans.
- Examples:
  - Sicilian Defense (1. e4 c5)
  - Ruy-Lopez (1. e4 e5 2. Nf3 Nc6 3. Bb5)

3. Hypermodern Openings:
- Allowing the opponent to take the center and attacking it from the sides.
- Examples:
  - King's Indian Defense
  - Nimzo-Indian Defense

4. Gambits:
- Sacrificing material for rapid development or an attack.
- Examples:
  - Queen's Gambit (1. d4 d5 2. c4)
  - King's Gambit (1. e4 e5 2. f4)
`,
    },
  ],
};

const LessonsPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('Beginner');
  const [activeLesson, setActiveLesson] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-sky-300 text-black">
      {/* Top bar with Back button on left, level buttons on right */}
      <div className="w-full bg-red-700 text-white p-4 flex justify-between items-center">
        <Link
          to="/home"
          className="p-2 bg-white text-black font-bold rounded-md border border-red-600 hover:bg-gray-200 transition"
        >
          Back to Home
        </Link>
        <div className="flex space-x-4">
          {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
            <button
              key={level}
              className={`p-2 rounded-md transition font-bold border border-gray-500 {
                selectedLevel === level
                  ? 'bg-white text-black'
                  : 'bg-white text-black hover:bg-gray-500'
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
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-red-700 text-center mb-6">Chess Lessons</h1>

        {lessons[selectedLevel]?.map((lesson, index) => (
          <div key={index} className="mb-4">
            <button
              className="w-full text-left p-3 rounded-lg shadow transition duration-200 bg-gray-500 hover:bg-red-200"
              onClick={() => setActiveLesson(activeLesson === index ? null : index)}
            >
              {lesson.title}
            </button>

            {activeLesson === index && (
              <div className="mt-2 p-4 border-l-4 rounded-lg bg-white border-red-600">
                <p className="whitespace-pre-line">{lesson.content}</p>

                {lesson.image && (
                  <div className="mt-4 flex justify-center">
                    <img src={lesson.image} alt="Chessboard" className="w-full max-w-md border rounded-lg" />
                  </div>
                )}

                {lesson.subLessons &&
                  lesson.subLessons.map((sub, subIndex) => (
                    <div key={subIndex} className="mt-4 p-4 rounded-lg bg-gray-300">
                      <h3 className="text-lg font-bold">{sub.name}</h3>
                      <p>{sub.description}</p>
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