import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">♟ Chess.com</h2>
      <ul>
        <li><Link to="/game">Play</Link></li>
        <li><Link to="/puzzles">Puzzles</Link></li>
        <li><Link to="/learn">Learn</Link></li>
        <li><Link to="/watch">Watch</Link></li>
        <li><Link to="/news">News</Link></li>
        <li><Link to="/social">Social</Link></li>
      </ul>
      <div className="auth-buttons">
        <button className="signup">Sign Up</button>
        <button className="login">Log In</button>
      </div>
    </div>
  );
};

export default NavBar;
