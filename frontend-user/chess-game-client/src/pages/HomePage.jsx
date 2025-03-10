import { useState } from "react";
import { FaChess, FaPuzzlePiece, FaGraduationCap, FaComments, FaUsers, FaBars, FaSignInAlt, FaSun, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState("en");

  const menuItems = [
    { name: "Play Online", icon: <FaChess />, path: "/game" }, 
    { name: "Play Computer", icon: <FaChess />, path: "/play-computer" },
    { name: "Create Room", icon: <FaUsers />, path: "/create-room" },
    { name: "Solve Puzzles", icon: <FaPuzzlePiece />, path: "/puzzles" },
    { name: "Lessons", icon: <FaGraduationCap />, path: "/learn" },
    { name: "Watch Games", icon: <FaComments />, path: "/watch-games" },
  ];
  

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "vi" : "en"));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-red-700 text-white p-4 transition-all duration-300 ease-in-out ${isExpanded ? "w-60" : "w-16"}`}
      >
        <button
          className="text-white mb-4 flex items-center gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <FaBars /> <span className={isExpanded ? "block" : "hidden"}>Menu</span>
        </button>
        <h1 className={`text-lg font-bold mb-4 ${isExpanded ? "block" : "hidden"}`}>ChessPlayer</h1>
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-red-800"
              onClick={() => navigate(item.path)}
            >
              {item.icon} <span className={isExpanded ? "block" : "hidden"}>{item.name}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 space-y-4">
          <button className="flex items-center gap-2" onClick={toggleLanguage}>
            <FaGlobe /> <span className={isExpanded ? "block" : "hidden"}>{language === "en" ? "English" : "Tiếng Việt"}</span>
          </button>
          <button className="flex items-center gap-2">
            <FaSun /> <span className={isExpanded ? "block" : "hidden"}>Light Mode</span>
          </button>
          <button className="flex items-center gap-2" onClick={() => navigate("/login")}>
            <FaSignInAlt /> <span className={isExpanded ? "block" : "hidden"}>Sign In</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100">
        <h2 className="text-2xl font-bold text-red-700 mb-6">Welcome to ChessPlayer!</h2>
        <div className="flex flex-col gap-4 w-80">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className="flex items-center gap-3 px-6 py-4 border-2 rounded-lg transition font-semibold w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              onClick={() => navigate(item.path)}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
