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
const StudyGroup = require("./models/StudyGroup");
const GroupMessage = require("./models/GroupMessage");

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
app.use(
    "/api/study-groups",
    require("./routes/study-groups")
);
app.use(
    "/api/group-messages",
    require("./routes/group-messages")
);
app.use("/api/matches", require("./routes/matches"));
app.use("/api/contact", require("./routes/contact"));
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

    socket.on("join_group", async (groupId) => {
        try {
            const id = String(groupId || "").trim();

            if (!id) {
                return socket.emit("group_chat_error", {
                    message: "Group ID is required.",
                });
            }

            const group = await StudyGroup.findById(id);

            if (!group) {
                return socket.emit("group_chat_error", {
                    message: "Study group not found.",
                });
            }

            const isMember = group.members.some(
                (memberId) =>
                    String(memberId) === socket.userId
            );

            if (!isMember) {
                return socket.emit("group_chat_error", {
                    message:
                        "Only group members can join the group chat.",
                });
            }

            socket.join(`group:${id}`);

            socket.emit("group_joined", {
                groupId: id,
            });
        } catch (error) {
            console.error(
                "Join group socket error:",
                error.message
            );

            socket.emit("group_chat_error", {
                message: "Could not join group chat.",
            });
        }
    });

    socket.on("send_group_message", async (payload = {}) => {
        try {
            const groupId = String(
                payload.groupId || ""
            ).trim();

            const text = String(
                payload.text || ""
            ).trim();

            if (!groupId || !text) {
                return socket.emit("group_chat_error", {
                    message:
                        "Group ID and message are required.",
                });
            }

            const group = await StudyGroup.findById(
                groupId
            );

            if (!group) {
                return socket.emit("group_chat_error", {
                    message: "Study group not found.",
                });
            }

            const isMember = group.members.some(
                (memberId) =>
                    String(memberId) === socket.userId
            );

            if (!isMember) {
                return socket.emit("group_chat_error", {
                    message:
                        "Only group members can send messages.",
                });
            }

            if (group.status !== "Active") {
                return socket.emit("group_chat_error", {
                    message:
                        "This study group is closed.",
                });
            }

            const message =
                await GroupMessage.create({
                    group: groupId,
                    sender: socket.userId,
                    text: text.slice(0, 2000),
                });

            const populated =
                await message.populate(
                    "sender",
                    "name email"
                );

            io.to(`group:${groupId}`).emit(
                "new_group_message",
                populated
            );
        } catch (error) {
            console.error(
                "Socket group message error:",
                error.message
            );

            socket.emit("group_chat_error", {
                message:
                    "Could not send group message.",
            });
        }
    });
    socket.on(
        "delete_group_message",
        async (payload = {}) => {
            try {
                const groupId = String(
                    payload.groupId || ""
                ).trim();

                const messageId = String(
                    payload.messageId || ""
                ).trim();

                if (!groupId || !messageId) {
                    return socket.emit(
                        "group_chat_error",
                        {
                            message:
                                "Group ID and message ID are required.",
                        }   
                    );
                }

                const group =
                    await StudyGroup.findById(groupId);

                if (!group) {
                    return socket.emit(
                        "group_chat_error",
                        {
                            message:
                                "Study group not found.",
                        }
                    );
                }

                const isMember =
                    group.members.some(
                        (memberId) =>
                            String(memberId) ===
                            socket.userId
                    );

                if (!isMember) {
                    return socket.emit(
                        "group_chat_error",
                        {
                            message:
                                "Only group members can delete messages.",
                        }
                    );
                }

                const message =
                    await GroupMessage.findOne({
                        _id: messageId,
                        group: groupId,
                    });

                if (!message) {
                    return socket.emit(
                        "group_chat_error",
                        {
                            message:
                                "Group message not found.",
                        }
                    );
                }

                if (
                    String(message.sender) !==
                    socket.userId
                ) {
                    return socket.emit(
                        "group_chat_error",
                        {
                            message:
                                "You can only delete your own messages.",
                        }
                    );
                }

                if (message.deleted) {
                    return socket.emit(
                        "group_chat_error",
                        {
                            message:
                                "Message is already deleted.",
                        }
                    );
                }

                message.deleted = true;
                message.text =
                    "This message was deleted.";

                await message.save();

                io.to(`group:${groupId}`).emit(
                    "group_message_deleted",
                    {
                        messageId: message._id,
                        text:
                            "This message was deleted.",
                    }
                );
            } catch (error) {
                console.error(
                    "Socket group message delete error:",
                    error.message
                );

                socket.emit(
                    "group_chat_error",
                    {
                        message:
                            "Could not delete group message.",
                    }
                );
            }
        }
    );
    
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

    socket.on("delete_message", async (payload = {}) => {
        try {
            const messageId = String(
                payload.messageId || ""
            );

            if (!messageId) {
                return socket.emit("chat_error", {
                    message: "Message ID is required.",
                });
            }

            const message = await Message.findById(
                messageId
            );

            if (!message) {
                return socket.emit("chat_error", {
                    message: "Message not found.",
                });
            }

            // Sirf message sender hi delete kar sakta hai
            if (
                String(message.sender) !==
                socket.userId
            ) {
                return socket.emit("chat_error", {
                    message:
                        "You can only delete your own messages.",
                });
            }

            if (message.deleted) {
                return socket.emit("chat_error", {
                    message: "Message is already deleted.",
                });
            }

            message.deleted = true;
            message.text = "This message was deleted.";

            await message.save();

            const deleteData = {
                messageId: message._id,
                text: "This message was deleted.",
            };

            // Sender ko real-time update
            io.to(`user:${message.sender}`).emit(
                "message_deleted",
                deleteData
            );

            // Receiver ko real-time update
            io.to(`user:${message.receiver}`).emit(
                "message_deleted",
                deleteData
            );
            socket.emit("message_delete_success", {
                messageId: message._id,
            });
        } catch (error) {
            console.error(
                "Socket delete message error:",
                error.message
            );

            socket.emit("chat_error", {
                message: "Could not delete message.",
            });
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
