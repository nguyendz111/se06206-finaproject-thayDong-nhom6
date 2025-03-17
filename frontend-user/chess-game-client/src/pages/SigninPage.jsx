
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import appleLogo from "../assets/images/apple_icon.png";
import googleLogo from "../assets/images/google_icon.png";

const SigninForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // Thêm state để hiển thị lỗi

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset lỗi trước khi xử lý

    // Kiểm tra email hợp lệ
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Invalid email format");
      return;
    }
    
    // Kiểm tra mật khẩu tối thiểu 6 ký tự
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      console.log("Signing in with:", formData);
      // Gọi API đăng nhập giả lập
      const response = await fakeLoginAPI(formData.email, formData.password);
      
      if (response.success) {
        navigate("/dashboard"); // Điều hướng sau khi đăng nhập thành công
      } else {
        setError("Incorrect email or password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  // Hàm giả lập API đăng nhập (thay bằng API thực tế nếu có)
  const fakeLoginAPI = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === "user@example.com" && password === "password123") {
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 p-4">
      <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl">♟️</span>
          <h2 className="text-2xl font-bold mt-2">Sign In to ChessPlayer</h2>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring focus:ring-blue-400"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring focus:ring-blue-400"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-700" />
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        <button className="w-full bg-gray-800 border border-gray-600 flex items-center justify-center py-3 rounded-lg hover:bg-gray-700 transition duration-200 mb-3">
          <img src={googleLogo} alt="Google" className="h-5 mr-3" />
          Continue with Google
        </button>

        <button className="w-full bg-gray-800 border border-gray-600 flex items-center justify-center py-3 rounded-lg hover:bg-gray-700 transition duration-200">
          <img src={appleLogo} alt="Apple" className="h-5 mr-3" />
          Continue with Apple
        </button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SigninForm;