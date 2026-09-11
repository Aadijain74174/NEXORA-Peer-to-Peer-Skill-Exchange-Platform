require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Message = require("./models/Message");
const Notification = require("./models/Notification");

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
    console.error(`Missing environment variables: ${missingEnv.join(", ")}`);
    console.error("Create a .env file from .env.example and restart the server.");
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: true, credentials: true },
});

app.set("io", io);

connectDB();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/matches", require("./routes/matches"));
app.use("/api/requests", require("./routes/requests"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/credits", require("./routes/credits"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/analytics", require("./routes/analytics"));

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Nexora API is running",
        database: "configured",
    });
});

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication required"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = String(decoded.id);
        next();
    } catch {
        next(new Error("Invalid or expired token"));
    }
});

io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    io.emit("presence", { userId: socket.userId, online: true });

    socket.on("join_chat", (partnerId) => {
        if (!partnerId || String(partnerId) === socket.userId) return;
        const room = `chat:${[socket.userId, String(partnerId)].sort().join(":")}`;
        socket.join(room);
    });

    socket.on("send_message", async (payload = {}) => {
        try {
            const receiver = String(payload.receiver || "");
            const text = String(payload.text || "").trim();

            if (!receiver || !text || receiver === socket.userId) {
                return socket.emit("chat_error", {
                    message: "Choose another user and enter a message.",
                });
            }

            const message = await Message.create({
                sender: socket.userId,
                receiver,
                text: text.slice(0, 2000),
            });

            const populated = await message.populate("sender receiver", "name email");
            const notification = await Notification.create({
                recipient: receiver,
                sender: socket.userId,
                type: "message",
                message: `New message from ${populated.sender.name}`,
                relatedId: message._id,
            });

            io.to(`user:${receiver}`).emit("new_message", populated);
            io.to(`user:${receiver}`).emit("notification", notification);
            socket.emit("message_sent", populated);
        } catch (error) {
            console.error("Socket message error:", error.message);
            socket.emit("chat_error", { message: "Could not send message." });
        }
    });

    socket.on("disconnect", () => {
        io.emit("presence", { userId: socket.userId, online: false });
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
    console.log(`Nexora running at http://localhost:${PORT}`);
});
