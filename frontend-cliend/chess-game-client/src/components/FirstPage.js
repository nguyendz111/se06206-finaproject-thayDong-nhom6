import { useNavigate } from "react-router-dom";
import backgroundImage from "../images/chess-bg.jpg"; // Đổi thành đường dẫn đúng của ảnh

export default function FirstPage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
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
          className="mt-6 bg-gray-600 text-white font-semibold px-6 py-3 text-xl rounded-lg hover:bg-gray-700 transition"
          onClick={() => navigate("/home")}
        >
          Join the fun — let’s get started
        </button>
      </div>
    </div>
  );
}