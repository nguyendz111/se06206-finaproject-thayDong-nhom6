import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/images/firstPage.jpg"; // Đổi thành đường dẫn đúng của ảnh

export default function FirstPage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Thanh điều hướng trên cùng */}
      <div className="absolute top-0 w-full bg-black bg-opacity-50 flex justify-end p-4">
        <button
          className="text-white font-semibold px-4 py-2 mx-2 bg-red-600 hover:bg-red-800 rounded transition"
          onClick={() => navigate("/login")}
        >
          Sign In
        </button>
        <button
          className="text-white font-semibold px-4 py-2 mx-2 bg-blue-600 hover:bg-blue-800 rounded transition"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
          Welcome to Chess Arena
        </h1>
        <p className="text-lg md:text-2xl mt-4 drop-shadow-lg">
          Play, learn, and master the game of kings!
        </p>

        {/* Nút vào trang Home */}
        <button
          className="mt-6 bg-yellow-500 text-black font-semibold px-6 py-3 text-xl rounded-lg hover:bg-yellow-600 transition"
          onClick={() => navigate("/home")}
        >
          Start Playing
        </button>
      </div>
    </div>
  );
}
