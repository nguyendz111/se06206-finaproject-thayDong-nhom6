require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Kiểm tra biến môi trường MONGO_URI
if (!process.env.MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env file!");
    process.exit(1);
}

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// Quản lý phòng chơi
let rooms = {};

io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Xử lý tạo phòng
    socket.on("create-room", ({ roomId, roomName, timeControl }) => {
        console.log(`📢 User ${socket.id} requested to create/join room ${roomId}`);

        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], roomName, timeControl };
            console.log(`✅ Created new room: ${roomId}`);
        }

        console.log(`📌 Room ${roomId} currently has ${rooms[roomId].players.length} players.`);

        if (rooms[roomId].players.length < 2) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);
            console.log(`👤 Player ${socket.id} joined room: ${roomId}`);

            // Gửi phản hồi có roomId
            io.to(roomId).emit("room-update", {
                message: "Room created successfully",
                roomId,  // Thêm roomId vào phản hồi
                room: {
                    players: rooms[roomId].players,
                    roomName,
                    timeControl
                }
            });
        } else {
            console.warn(`⚠ Room ${roomId} is full!`);
            socket.emit("room-full");
        }
    });

    // Xử lý di chuyển quân cờ
    socket.on("move", ({ roomId, move }) => {
        console.log(`♟ Move received in room ${roomId}:`, move);
        socket.to(roomId).emit("opponent-move", move);
    });

    // Xử lý khi người dùng rời phòng
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        
        for (let room in rooms) {
            const beforeCount = rooms[room].players.length;
            rooms[room].players = rooms[room].players.filter(id => id !== socket.id);
            const afterCount = rooms[room].players.length;

            if (beforeCount !== afterCount) {
                console.log(`📌 Removed player ${socket.id} from room ${room}. Now has ${afterCount} players.`);
            }

            if (rooms[room].players.length === 0) {
                delete rooms[room];
                console.log(`🗑 Room ${room} deleted.`);
            }
        }
    });
});

// API REST để tạo phòng
app.post("/create-room", (req, res) => {
    const { roomId, roomName, timeControl } = req.body;

    if (!roomId || !roomName || !timeControl) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!rooms[roomId]) {
        rooms[roomId] = { players: [], roomName, timeControl };
    }

    if (rooms[roomId].players.length < 2) {
        res.status(201).json({
            message: "Room created successfully",
            roomId,  // Trả về roomId
            room: {
                players: rooms[roomId].players,
                roomName,
                timeControl
            }
        });
    } else {
        res.status(400).json({ error: "Room is full" });
    }
});

// Lắng nghe server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`❌ Error: Port ${PORT} is already in use!`);
        process.exit(1);
    } else {
        console.error("❌ Server error:", err);
        process.exit(1);
    }
});
