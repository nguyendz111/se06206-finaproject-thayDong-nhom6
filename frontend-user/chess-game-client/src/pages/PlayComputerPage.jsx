import React, { useContext } from "react";
import SideBar from "../components/SideBar";
import { ThemeLanguageContext } from "../context/ThemeLanguageContext";

const PlayComputerPage = () => {
  const { theme } = useContext(ThemeLanguageContext);

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className="fixed top-0 left-0 h-full w-64">
        <SideBar />
      </div>
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-3xl font-bold text-red-700 text-center">Play Against Computer</h1>
      </div>
    </div>
  );
};

export default PlayComputerPage;
