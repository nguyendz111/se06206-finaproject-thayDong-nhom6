import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import googleLogo from "../assets/images/google-icon.png";
import appleLogo from "../assets/images/apple-icon.png";

const SigninForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign-in data:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-sm text-white">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <span className="text-3xl">♟️</span> {/* Logo */}
          <h2 className="text-2xl font-bold mt-2">Sign In to Chess Master</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring focus:ring-blue-400"
              placeholder="Email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring focus:ring-blue-400"
              placeholder="Password"
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
          >
            Sign In
          </button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-700" />
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Social Login */}
        <button className="w-full bg-gray-800 border border-gray-700 flex items-center justify-center py-3 rounded-lg hover:bg-gray-700 transition mb-3">
          <img src={googleLogo} alt="Google" className="h-5 mr-3" />
          Continue with Google
        </button>

        <button className="w-full bg-gray-800 border border-gray-700 flex items-center justify-center py-3 rounded-lg hover:bg-gray-700 transition">
          <img src={appleLogo} alt="Apple" className="h-5 mr-3" />
          Continue with Apple
        </button>
        {/* Create Account Link */}
        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/sign-up")}
            className="text-blue-400 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default SigninForm;