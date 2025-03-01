import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaChessPawn, FaPuzzlePiece, FaGraduationCap, FaEye, 
  FaNewspaper, FaUsers, FaEllipsisH, FaSearch, FaSignInAlt, FaUserPlus 
} from "react-icons/fa";
import { GiTrophyCup, GiChessKnight, GiBrain, GiArchiveRegister } from "react-icons/gi";

const SidebarMenu = () => {
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showPuzzlesMenu, setShowPuzzlesMenu] = useState(false);

  return (
    <div className="w-64 h-screen bg-gray-700 text-white p-4">
      {/* Tiêu đề với logo */}
      <div className="flex items-center mb-4">
        <img src="/logo.png" alt="Chess Logo" className="w-8 h-8 mr-2" />
        <h1 className="text-xl font-bold text-amber-500">ChessPlayer</h1>
      </div>

      {/* Nút Play */}
      <button
        className="flex items-center w-full p-2 hover:bg-gray-600 rounded"
        onClick={() => setShowPlayMenu(!showPlayMenu)}
      >
        <GiChessKnight className="mr-2 text-yellow-500" /> Play
      </button>

      {/* Menu phụ Play */}
      {showPlayMenu && (
        <div className="bg-gray-800 mt-2 p-2 rounded">
          <Link to="/game" className="block w-full text-left p-2 hover:bg-gray-600">
            ▶ Play
          </Link>
          <button className="block w-full text-left p-2 hover:bg-gray-600">🤖 Play Bots</button>
          <button className="block w-full text-left p-2 hover:bg-gray-600">🏆 Tournaments</button>
          <button className="block w-full text-left p-2 hover:bg-gray-600">🎲 4 Player & Variants</button>
          <button className="block w-full text-left p-2 hover:bg-gray-600">📊 Leaderboard</button>
        </div>
      )}

      {/* Nút Puzzles */}
      <button
        className="flex items-center w-full p-2 hover:bg-gray-600 rounded"
        onClick={() => setShowPuzzlesMenu(!showPuzzlesMenu)}
      >
        <FaPuzzlePiece className="mr-2 text-orange-400" /> Puzzles
      </button>

      {/* Menu phụ Puzzles */}
      {showPuzzlesMenu && (
        <div className="bg-gray-800 mt-2 p-2 rounded">
          <Link to="/puzzles" className="block py-1 flex items-center hover:bg-gray-600">
            <GiBrain className="mr-2 text-blue-400" /> Puzzles
          </Link>
          <Link to="/puzzle-rush" className="block py-1 flex items-center hover:bg-gray-600">
            <GiTrophyCup className="mr-2 text-yellow-500" /> Puzzle Rush
          </Link>
          <Link to="/puzzle-battle" className="block py-1 flex items-center hover:bg-gray-600">
            <FaChessPawn className="mr-2 text-red-500" /> Puzzle Battle
          </Link>
          <Link to="/daily-puzzle" className="block py-1 flex items-center hover:bg-gray-600">
            <GiBrain className="mr-2 text-green-400" /> Daily Puzzle
          </Link>
          <Link to="/custom-puzzles" className="block py-1 flex items-center hover:bg-gray-600">
            <GiArchiveRegister className="mr-2 text-purple-400" /> Custom Puzzles
          </Link>
        </div>
      )}

      {/* Search Box */}
      <div className="relative mt-4">
        <FaSearch className="absolute left-3 top-3 text-gray-300" />
        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 pl-10 bg-gray-600 rounded focus:outline-none focus:ring focus:ring-gray-400"
        />
      </div>

      {/* Nút đăng ký & đăng nhập */}
      <div className="mt-4">
        <Link to="/signup" className="block w-full p-2 bg-green-600 text-center rounded flex items-center justify-center hover:bg-green-700">
          <FaUserPlus className="mr-2" /> Sign Up
        </Link>
        <Link to="/login" className="block w-full p-2 bg-gray-500 text-center rounded mt-2 flex items-center justify-center hover:bg-gray-600">
          <FaSignInAlt className="mr-2" /> Log In
        </Link>
      </div>
    </div>
  );
};

export default SidebarMenu;
