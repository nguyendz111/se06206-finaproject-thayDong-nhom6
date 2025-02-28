import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import googleLogo from "../assets/image/google-icon.png";
import appleLogo from "../assets/image/apple-icon.png";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Form Data Submitted:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-4">
          <span className="text-2xl">♟️</span> {/* Logo */}
          <h2 className="text-2xl font-bold mt-2">Chess Master</h2>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center">Create your account</h2>

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
        <div className="space-y-2">
          <button className="w-full bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700">
            <img src={googleLogo} alt="Google" className="h-5" />
            Continue with Google
          </button>
          <button className="w-full bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700">
            <img src={appleLogo} alt="Apple" className="h-5" />
            Continue with Apple
          </button>
        </div>

        {/* Already have an account */}
        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <button onClick={() => navigate("/sign-in")} className="text-green-400 hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
