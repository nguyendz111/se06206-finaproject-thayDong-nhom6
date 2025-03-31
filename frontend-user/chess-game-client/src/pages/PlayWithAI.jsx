import React from "react";
import Board from "../components/BoardAI";

const PlayWithAI = () => {
  return (
    <div>
      <h2>Playing Against AI</h2>
      <Board isAI={true} />
    </div>
  );
};

export default PlayWithAI;
