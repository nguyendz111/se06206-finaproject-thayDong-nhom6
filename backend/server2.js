const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config(); // Thêm dòng này

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://150.95.115.213:3003",
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Dùng biến môi trường
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL || "mongodb://150.95.115.213:27017/chess_db" }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 ngày
  })
);

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URL || "mongodb://150.95.115.213:27017/chess_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Kết nối MongoDB thành công (Server 2)"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Schema người dùng
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "/images/avatar.png" },
});

const User = mongoose.model("User", userSchema);

// Route đăng ký
app.post("/register", async (req, res) => {
  const { username, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Tên người dùng hoặc email đã tồn tại!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      phone,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại!" });
  }
});

// Route đăng nhập
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!user) {
      return res.status(400).json({ message: "Mật khẩu không đúng!" });
    }

    req.session.user = { id: user._id, username: user.username, avatar: user.avatar };
    res.status(200).json({ message: "Đăng nhập thành công!", user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại!" });
  }
});

// Route kiểm tra session
app.get("/session-user", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Chưa đăng nhập!" });
  }
});

// Route đăng xuất
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi đăng xuất!" });
    }
    res.status(200).json({ message: "Đăng xuất thành công!" });
  });
});

const PORT = process.env.PORT || 3002; // Dùng biến môi trường
app.listen(PORT, () => {
  console.log(`🚀 Server 2 đang chạy tại http://150.95.115.213:${PORT}`);
});