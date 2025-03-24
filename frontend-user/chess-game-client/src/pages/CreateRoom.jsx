import React from "react";
import SideBar from "../components/SideBar"; // Import SideBar đã có

const CreateRoom = () => {

  return (
    
    <div className="play-computer-container">
      <h1>Create Room Page</h1>
        <SideBar /> {/* Hiển thị Sidebar bên trái */}
    </div>
  );
};

export default CreateRoom;