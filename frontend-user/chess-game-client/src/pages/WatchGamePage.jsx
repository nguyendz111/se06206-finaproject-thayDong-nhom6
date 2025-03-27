import React, { useContext } from "react";
import SideBar from "../components/SideBar";
import { ThemeLanguageContext } from "../context/ThemeLanguageContext";

const WatchGame = () => {
  const { theme } = useContext(ThemeLanguageContext); // Lấy theme từ context

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Sidebar bên trái */}
      <div className="fixed top-0 left-0 h-full w-64">
        <SideBar />
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-3xl font-bold text-red-700 text-center">Watch Games</h1>
      </div>
    </div>
  );
};

export default WatchGame;
