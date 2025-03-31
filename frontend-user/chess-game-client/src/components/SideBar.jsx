import { useState, useContext } from "react";
import { FaChess, FaPuzzlePiece, FaGraduationCap, FaComments, FaUsers, FaBars, FaSignInAlt, FaSun, FaMoon, FaGlobe } from "react-icons/fa";
import { ThemeLanguageContext } from "../context/ThemeLanguageContext"; // Import Context
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme } = useContext(ThemeLanguageContext); // Lấy từ Context
  const [isExpanded, setIsExpanded] = useState(false);

  // Danh sách menu
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
      {/* Nút mở rộng Sidebar */}
      <button className="text-white mb-4 flex items-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
        <FaBars /> <span className={isExpanded ? "block" : "hidden"}>{language === "en" ? "Menu" : "Danh Mục"}</span>
      </button>

      {/* Tiêu đề */}
      <h1 className={`text-lg font-bold mb-4 ${isExpanded ? "block" : "hidden"}`}>ChessPlayer</h1>

      {/* Danh sách menu */}
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.path} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-red-800 transition" onClick={() => navigate(item.path)}>
            {item.icon} <span className={isExpanded ? "block" : "hidden"}>{item.name}</span>
          </li>
        ))}
      </ul>

      {/* Cài đặt Theme & Ngôn ngữ */}
      <div className="mt-10 space-y-4">
        <button className="flex items-center gap-2 transition hover:text-yellow-400" onClick={() => setLanguage(language === "en" ? "vi" : "en")}>
          <FaGlobe /> <span className={isExpanded ? "block" : "hidden"}>{language === "en" ? "English" : "Tiếng Việt"}</span>
        </button>
        <button className="flex items-center gap-2 transition hover:text-yellow-400" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
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
