import { useState, useEffect } from "react";

import {
  FaGamepad,
  FaPuzzlePiece,
  FaBook,
  FaTv,
  FaCommentDots,
  FaSun,
  FaMoon,
  FaGlobe,
  FaSignOutAlt,
  FaSignInAlt
} from "react-icons/fa";

function MenuItem({ icon, text, isExpanded, link }) {
  return (
    <a href={link} className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
      {icon}
      {isExpanded && <span>{text}</span>}
    </a>
  );
}

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState({ username: "DemoUser", avatar: "/images/avatar.png" }); // Giả lập

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) setDarkMode(savedMode === "true");
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className={`flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Sidebar */}
      <aside
        className={`min-h-screen bg-orange-900 text-white flex flex-col items-center transition-all duration-300 ${
          isExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!keepOpen) {
            setIsExpanded(false);
            setPlayMenuOpen(false);
          }
        }}
      >
        <a href="/" className="flex items-center space-x-3 mt-5 mb-5">
          <img src="/images/chess-piece.png" alt="logo" className="w-12 h-12" />
          {isExpanded && <span className="text-2xl font-bold">CoTuong.com</span>}
        </a>

        <nav className="space-y-4 w-full">
          <div
            className="relative"
            onMouseEnter={() => {
              setPlayMenuOpen(true);
              setKeepOpen(true);
            }}
            onMouseLeave={() => {
              setKeepOpen(false);
              setTimeout(() => {
                if (!keepOpen) setPlayMenuOpen(false);
              }, 200);
            }}
          >
            <MenuItem icon={<FaGamepad />} text={language === "en" ? "Play Now" : "Chơi Ngay"} isExpanded={isExpanded} link="/home-page" />
          </div>
          <MenuItem icon={<FaPuzzlePiece />} text={language === "en" ? "Puzzles" : "Câu đố"} isExpanded={isExpanded} link="/chess-puzzle" />
          <MenuItem icon={<FaBook />} text={language === "en" ? "Course" : "Khóa học"} isExpanded={isExpanded} link="/chess-courses" />
          <MenuItem icon={<FaCommentDots />} text={language === "en" ? "Chat" : "Trò chuyện"} isExpanded={isExpanded} link="/chess-chat" />
        </nav>

        <div className="mt-auto space-y-3 w-full mb-5">
          <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded" onClick={() => setLanguage(language === "en" ? "vi" : "en")}>
            <FaGlobe />
            {isExpanded && <span>{language === "en" ? "English" : "Tiếng Việt"}</span>}
          </button>
          <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {isExpanded && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {user ? (
            <div className="relative w-full flex flex-col items-center">
              <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
                <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white" />
                {isExpanded && <span>{user.username}</span>}
              </button>
              <button className="mt-2 w-full flex items-center justify-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition" onClick={handleLogout}>
                <FaSignOutAlt className="mr-2" /> {isExpanded ? (language === "en" ? "Sign Out" : "Đăng xuất") : ""}
              </button>
            </div>
          ) : (
            <MenuItem icon={<FaSignInAlt />} text={language === "en" ? "Sign In" : "Đăng nhập"} isExpanded={isExpanded} link="/chess-login" />
          )}
        </div>
      </aside>

      {playMenuOpen && (
        <div
          className={`absolute ${isExpanded ? "left-64" : "left-16"} top-0 bg-white text-gray-900 shadow-lg w-48 border border-gray-300 flex flex-col min-h-screen`}
          onMouseEnter={() => setKeepOpen(true)}
          onMouseLeave={() => {
            setKeepOpen(false);
            setPlayMenuOpen(false);
            setIsExpanded(false);
          }}
        >
          <a href="/chess-offline" className="block p-3 hover:bg-gray-200"><img src="images/play-computer-sm.svg" alt="compiter" /> {language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
          <a href="/chess-online" className="block p-3 hover:bg-gray-200"><img src="images/challenge-friends.svg" alt="computer" /> {language === "en" ? "Play Online" : "Chơi trực tuyến"}</a>
          <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
          <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <h2 className="text-3xl font-bold mb-5">
          <a href="/" className="text-orange-900 hover:underline">{language === "en" ? "Welcome to CoTuong.com!" : "Chào mừng đến với CoTuong.com!"}</a>
        </h2>
        <div className="space-y-4 w-96">
          <MainButton icon={<FaGamepad />} title={language === "en" ? "Play Online" : "Chơi Online"} subtitle={language === "en" ? "Challenge Players Worldwide" : "Thách đấu người chơi toàn cầu"} link="/chess-online" />
          <MainButton icon={<FaTv />} title={language === "en" ? "Play Computer" : "Chơi với máy"} subtitle={language === "en" ? "Test Your Skills Against AI" : "Thử thách với AI"} link="/chess-offline" />
          <MainButton icon={<FaPuzzlePiece />} title={language === "en" ? "Solve Puzzles" : "Giải đố"} subtitle={language === "en" ? "Solve Brain-Teasing Puzzles" : "Giải câu đố thử thách"} link="/chess-puzzle" />
          <MainButton icon={<FaBook />} title={language === "en" ? "Lessons" : "Khóa học"} subtitle={language === "en" ? "Learn How to Play" : "Học cách chơi Cờ Tướng"} link="/chess-courses" />
          <MainButton icon={<FaTv />} title={language === "en" ? "Watch Games" : "Xem Trận Đấu"} subtitle={language === "en" ? "Learn from Other Players" : "Học từ người chơi khác"} link="/ActiveGames" />
        </div>
      </main>
    </div>
  );
}


function MainButton({ icon, title, subtitle, link }) {
  return (
    <a href={link} className="flex items-center space-x-4 w-full border border-orange-900 p-4 rounded-lg hover:bg-red-100">
      <div className="text-orange-900 text-xl">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-orange-900">{title}</h3>
        <p className="text-sm">{subtitle}</p>
      </div>
    </a>
  );
}