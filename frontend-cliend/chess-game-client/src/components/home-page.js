import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaGamepad,
  FaPuzzlePiece,
  FaTv,
  FaGraduationCap,
  FaComments,
  FaSun,
  FaMoon,
  FaGlobe,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";

function MenuItem({ icon, text, isExpanded, link }) {
  return (
    <a
      href={link}
      className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded"
    >
      {icon}
      {isExpanded && <span>{text}</span>}
    </a>
  );
}

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy trạng thái dark mode
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) setDarkMode(savedMode === "true");

    // Lấy thông tin user từ backend
    const checkSession = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/session-user`,
          { withCredentials: true }
        );
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      }
    };
    checkSession();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <div className={`flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Sidebar */}
      <aside
        className={`min-h-screen bg-orange-900 text-white flex flex-col items-center transition-all duration-300 ${
          isExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <a href="/" className="flex items-center space-x-3 mt-5 mb-5">
          {isExpanded && <span className="text-2xl font-bold">ChessPlayer</span>}
        </a>

        <nav className="space-y-4 w-full">
          <MenuItem
            icon={<FaGamepad />}
            text={language === "en" ? "Play Now" : "Chơi Ngay"}
            isExpanded={isExpanded}
            link="/home"
          />
          <MenuItem
            icon={<FaPuzzlePiece />}
            text={language === "en" ? "Puzzles" : "Câu đố"}
            isExpanded={isExpanded}
            link="/puzzleclient"
          />
          <MenuItem
            icon={<FaGraduationCap />}
            text={language === "en" ? "Course" : "Khóa học"}
            isExpanded={isExpanded}
            link="/learn"
          />
          <MenuItem
            icon={<FaTv />}
            text={language === "en" ? "Play Computer" : "Chơi với máy"}
            isExpanded={isExpanded}
            link="/game/ai"
          />
        </nav>

        <div className="mt-auto space-y-3 w-full mb-5">
          <button
            className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded"
            onClick={() => setLanguage(language === "en" ? "vi" : "en")}
          >
            <FaGlobe />
            {isExpanded && <span>{language === "en" ? "English" : "Tiếng Việt"}</span>}
          </button>
          <button
            className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded"
            onClick={toggleDarkMode}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {isExpanded && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {user ? (
            <div className="relative w-full flex flex-col items-center">
              <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                {isExpanded && <span>{user.username}</span>}
              </button>
              <button
                className="mt-2 w-full flex items-center justify-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-2" />{" "}
                {isExpanded ? (language === "en" ? "Sign Out" : "Đăng xuất") : ""}
              </button>
            </div>
          ) : (
            <MenuItem
              icon={<FaSignInAlt />}
              text={language === "en" ? "Sign In" : "Đăng nhập"}
              isExpanded={isExpanded}
              link="/chess-login"
            />
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <h2 className="text-3xl font-bold mb-5">
          <a href="/" className="text-orange-900 hover:underline">
            {language === "en" ? "Welcome to ChessPlayer!" : "Chào mừng đến với ChessPlayer!"}
          </a>
        </h2>
        <div className="space-y-4 w-96">
          <MainButton
            icon={<FaGamepad />}
            title={language === "en" ? "Play Online" : "Chơi Online"}
            subtitle={language === "en" ? "Challenge Players Worldwide" : "Thách đấu người chơi toàn cầu"}
            link="/chess-online"
          />
          <MainButton
            icon={<FaTv />}
            title={language === "en" ? "Play Computer" : "Chơi với máy"}
            subtitle={language === "en" ? "Test Your Skills Against AI" : "Thử thách với AI"}
            link="/game/ai"
          />
          <MainButton
            icon={<FaPuzzlePiece />}
            title={language === "en" ? "Solve Puzzles" : "Giải đố"}
            subtitle={language === "en" ? "Solve Brain-Teasing Puzzles" : "Giải câu đố thử thách"}
            link="/puzzleclient"
          />
          <MainButton
            icon={<FaGraduationCap />}
            title={language === "en" ? "Lessons" : "Khóa học"}
            subtitle={language === "en" ? "Learn How to Play" : "Học cách chơi Cờ Tướng"}
            link="/learn"
          />
          <MainButton
            icon={<FaComments />}
            title={language === "en" ? "Watch Games" : "Xem Trận Đấu"}
            subtitle={language === "en" ? "Learn from Other Players" : "Học từ người chơi khác"}
            link="/monitor"
          />
        </div>
      </main>
    </div>
  );
}

function MainButton({ icon, title, subtitle, link }) {
  return (
    <a
      href={link}
      className="flex items-center space-x-4 w-full border border-orange-900 p-4 rounded-lg hover:bg-red-100"
    >
      <div className="text-orange-900 text-xl">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-orange-900">{title}</h3>
        <p className="text-sm">{subtitle}</p>
      </div>
    </a>
  );
}