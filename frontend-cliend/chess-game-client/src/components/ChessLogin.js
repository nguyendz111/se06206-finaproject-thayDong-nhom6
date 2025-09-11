import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChessLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra session khi component mount
  useEffect(() => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        formData,
        { withCredentials: true }
      );
      setMessage(response.data.message);
      setUser(response.data.user);
      setTimeout(() => navigate("/"), 2000); // Chuyển hướng về trang chính sau 2 giây
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ Lỗi máy chủ");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/logout`,
        {},
        { withCredentials: true }
      );
      setMessage(response.data.message);
      setUser(null);
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ Lỗi máy chủ");
    }
  };

  if (user) {
    return (
      <div style={styles.container}>
        <h2>Xin chào, {user.username}!</h2>
        <p>Email: {user.email}</p>
        <img src={user.avatar} alt="Avatar" style={styles.avatar} />
        <p>Role: {user.role}</p>
        <button onClick={handleLogout} style={styles.button}>
          Đăng Xuất
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
          Đăng Nhập
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
      <p>
        Chưa có tài khoản?{" "}
        <span
          style={styles.link}
          onClick={() => navigate("/chess-register")}
        >
          Đăng ký
        </span>
      </p>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  input: {
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    color: "#333",
  },
  link: {
    color: "blue",
    cursor: "pointer",
    textDecoration: "underline",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
  },
};

export default ChessLogin;