import { useState } from "react";
import { FaChess, FaPuzzlePiece, FaGraduationCap, FaComments, FaUsers, FaBars, FaSignInAlt, FaSun, FaMoon, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Đổi ngôn ngữ
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "vi" : "en"));
    localStorage.setItem("language", language === "en" ? "vi" : "en");
  };

  // Đổi theme Light/Dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  const menuItems = [
    { name: language === "en" ? "Play Online" : "Chơi Online", icon: <FaChess />, path: "/game" },
    { name: language === "en" ? "Play Computer" : "Chơi với Máy", icon: <FaChess />, path: "/play-computer" },
    { name: language === "en" ? "Create Room" : "Tạo Phòng", icon: <FaUsers />, path: "/create-room" },
    { name: language === "en" ? "Solve Puzzles" : "Giải Đố", icon: <FaPuzzlePiece />, path: "/puzzles" },
    { name: language === "en" ? "Lessons" : "Bài Học", icon: <FaGraduationCap />, path: "/learn" },
    { name: language === "en" ? "Watch Games" : "Xem Trận", icon: <FaComments />, path: "/watch-games" },
  ];

  return (
    <div className={`bg-red-700 text-white p-4 transition-all duration-300 ease-in-out ${isExpanded ? "w-60" : "w-16"} h-screen fixed left-0 top-0`}>
      <button className="text-white mb-4 flex items-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
        <FaBars /> <span className={isExpanded ? "block" : "hidden"}>{language === "en" ? "Menu" : "Danh Mục"}</span>
      </button>
      <h1 className={`text-lg font-bold mb-4 ${isExpanded ? "block" : "hidden"}`}>ChessPlayer</h1>
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.name} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-red-800 transition" onClick={() => navigate(item.path)}>
            {item.icon} <span className={isExpanded ? "block" : "hidden"}>{item.name}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 space-y-4">
        <button className="flex items-center gap-2 transition hover:text-yellow-400" onClick={toggleLanguage}>
          <FaGlobe /> <span className={isExpanded ? "block" : "hidden"}>{language === "en" ? "English" : "Tiếng Việt"}</span>
        </button>
        <button className="flex items-center gap-2 transition hover:text-yellow-400" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
          <span className={isExpanded ? "block" : "hidden"}>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>
        <button className="flex items-center gap-2 transition hover:text-yellow-400" onClick={() => navigate("/login")}>
          <FaSignInAlt /> <span className={isExpanded ? "block" : "hidden"}>{language === "en" ? "Sign In" : "Đăng Nhập"}</span>
        </button>
      </div>
    </div>
  );
}
