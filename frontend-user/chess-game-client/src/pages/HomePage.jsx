import { useState, useEffect } from "react";
import { FaChess, FaPuzzlePiece, FaGraduationCap, FaComments, FaUsers, FaBars, FaSignInAlt, FaSun, FaMoon, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "vi" : "en"));
    localStorage.setItem("language", language === "en" ? "vi" : "en");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handlePlayComputer = () => {
    navigate("/game/ai");
  };

  const handlePlayOnline = () => {
    const roomId = Math.random().toString(36).substring(7);
    navigate(`/game/online/${roomId}`);
  };

  const menuItems = [
    { name: language === "en" ? "Play Online" : "Chơi Online", icon: <FaChess />, onClick: handlePlayOnline },
    { name: language === "en" ? "Play Computer" : "Chơi với Máy", icon: <FaChess />, onClick: handlePlayComputer },
    { name: language === "en" ? "Create Room" : "Tạo Phòng", icon: <FaUsers />, path: "/create-room" },
    { name: language === "en" ? "Solve Puzzles" : "Giải Đố", icon: <FaPuzzlePiece />, path: "/puzzles" },
    { name: language === "en" ? "Lessons" : "Bài Học", icon: <FaGraduationCap />, path: "/learn" },
    { name: language === "en" ? "Watch Games" : "Xem Trận", icon: <FaComments />, path: "/watch-games" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className={`bg-red-700 text-white p-4 transition-all duration-300 ease-in-out ${isExpanded ? "w-60" : "w-16"}`}>
        <button className="text-white mb-4 flex items-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
          <FaBars /> <span className={isExpanded ? "block" : "hidden"}>{language === "en" ? "Menu" : "Danh Mục"}</span>
        </button>
        <h1 className={`text-lg font-bold mb-4 ${isExpanded ? "block" : "hidden"}`}>ChessPlayer</h1>
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.name} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-red-800 transition" onClick={item.onClick || (() => navigate(item.path))}>
              {item.icon} <span className={isExpanded ? "block" : "hidden"}>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-6">{language === "en" ? "Welcome to ChessPlayer!" : "Chào mừng đến với ChessPlayer!"}</h2>
        <div className="flex flex-col gap-4 w-80">
          {menuItems.map((item) => (
            <button key={item.name} className="flex items-center gap-3 px-6 py-4 border-2 rounded-lg transition font-semibold w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-black" onClick={item.onClick || (() => navigate(item.path))}>
              {item.icon} {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
