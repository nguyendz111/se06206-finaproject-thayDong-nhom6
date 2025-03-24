import React from "react";
import SideBar from "../components/SideBar"; // Import SideBar đã có

const WatchGame = () => {

  return (
    
    <div className="play-computer-container">
      <h1>Watch Games Page</h1>
        <SideBar /> {/* Hiển thị Sidebar bên trái */}
    </div>
  );
};

export default WatchGame;