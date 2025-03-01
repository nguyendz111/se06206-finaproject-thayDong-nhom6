import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import appleLogo from "../assets/images/apple_icon.png";
import googleLogo from "../assets/images/google_icon.png";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(""); // Thêm state để hiển thị lỗi

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset lỗi trước khi kiểm tra

    // Kiểm tra email hợp lệ
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Invalid email format");
      return;
    }

    // Kiểm tra độ dài mật khẩu (tối thiểu 8 ký tự, có số & chữ in hoa)
    if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
      return;
    }

    // Kiểm tra xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      console.log("Registering with:", formData);
      // Gọi API đăng ký giả lập
      const response = await fakeSignupAPI(formData.email, formData.password);

      if (response.success) {
        navigate("/dashboard"); // Chuyển hướng sau khi đăng ký thành công
      } else {
        setError("Registration failed. Try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  // Hàm giả lập API đăng ký (thay bằng API thực tế nếu có)
  const fakeSignupAPI = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email !== "existing@example.com") {
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500">
      <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <span className="text-3xl">♟️</span> {/* Logo */}
          <h2 className="text-2xl font-bold mt-2">Create your account</h2>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {/* Email Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring focus:ring-green-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring focus:ring-green-400"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring focus:ring-green-400"
            required
          />

          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
            Sign Up
          </button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-4">
          <div className="border-t border-gray-700 flex-grow"></div>
          <span className="px-2 text-gray-400">OR</span>
          <div className="border-t border-gray-700 flex-grow"></div>
        </div>

        {/* Social Signup Buttons */}
        <button className="w-full bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700">
          <img src={googleLogo} alt="Google" className="h-5" />
          Continue with Google
        </button>
        <button className="w-full bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 mt-2 hover:bg-gray-700">
          <img src={appleLogo} alt="Apple" className="h-5" />
          Continue with Apple
        </button>

        {/* Already have an account */}
        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-green-400 hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;