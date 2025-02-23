// src/components/Sidebar.jsx
import React from "react";
import { FaChessKnight, FaPuzzlePiece, FaGraduationCap, FaBinoculars, FaNewspaper, FaUserFriends, FaEllipsisH, FaSearch } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 shadow-lg">
      {/* Logo */}
      <div className="flex items-center space-x-2 text-green-400 text-2xl font-bold mb-6">
        <FaChessKnight />
        <span>Chess.com</span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1">
        <ul className="space-y-4">
          <li className="flex items-center space-x-2 hover:text-green-400 cursor-pointer">
            <FaChessKnight /> <span>Play</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-400 cursor-pointer">
            <FaPuzzlePiece /> <span>Puzzles</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-400 cursor-pointer">
            <FaGraduationCap /> <span>Learn</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-400 cursor-pointer">
            <FaBinoculars /> <span>Watch</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-400 cursor-pointer">
            <FaNewspaper /> <span>News</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-400 cursor-pointer">
            <FaUserFriends /> <span>Social</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-400 cursor-pointer">
            <FaEllipsisH /> <span>More</span>
          </li>
        </ul>
      </nav>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 pl-8 rounded bg-gray-800 text-white border-none focus:outline-none"
        />
        <FaSearch className="absolute left-2 top-3 text-gray-500" />
      </div>

      {/* Buttons */}
      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded mb-2">
        Sign Up
      </button>
      <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded">
        Log In
      </button>
    </div>
  );
};

export default Sidebar;
