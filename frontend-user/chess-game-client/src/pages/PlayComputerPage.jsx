import React from "react";
import SideBar from "../components/SideBar"; // Import SideBar đã có
import "../style/PlayComputerPage.css"; // (Tạo file CSS riêng nếu cần)

const PlayComputerPage = () => {

  return (
    
    <div className="play-computer-container">
      <h1>Play Against AI</h1>
        <SideBar /> {/* Hiển thị Sidebar bên trái */}
    </div>
  );
};

export default PlayComputerPage;
