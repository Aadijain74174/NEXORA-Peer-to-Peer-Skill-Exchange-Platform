const router = require("express").Router();
const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

router.get("/with/:userId", auth, async (req, res) => {
    try {
        const partner = await User.findById(req.params.userId).select("_id name email");
        if (!partner) return res.status(404).json({ success: false, message: "User not found." });

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id },
            ],
        })
            .sort({ createdAt: 1 })
            .limit(300)
            .populate("sender receiver", "name email");

        res.json({ success: true, partner, messages });
    } catch {
        res.status(400).json({ success: false, message: "Could not load conversation." });
    }
});

router.delete("/:messageId", auth, async (req, res) => {
    try {
        const message = await Message.findById(
            req.params.messageId
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found.",
            });
        }

        // Sirf message bhejne wala user delete kar sakta hai
        if (
            message.sender.toString() !==
            String(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only delete your own messages.",
            });
        }

        if (message.deleted) {
            return res.status(400).json({
                success: false,
                message: "Message is already deleted.",
            });
        }

        message.deleted = true;
        message.text = "This message was deleted.";
        await message.save();

        const io = req.app.get("io");

        if (io) {
            io.to(`user:${message.receiver}`).emit(
                "message_deleted",
                {
                    messageId: message._id,
                    text: "This message was deleted.",
                }
            );

            io.to(`user:${message.sender}`).emit(
                "message_deleted",
                {
                    messageId: message._id,
                    text: "This message was deleted.",
                }
            );
        }

        res.json({
            success: true,
            message: "Message deleted successfully.",
            data: {
                messageId: message._id,
                deleted: true,
                text: "This message was deleted.",
            },
        });
    } catch (error) {
        console.error(
            "Delete message error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Could not delete message.",
        });
    }
});

router.put("/with/:userId/read", auth, async (req, res) => {
    try {
        await Message.updateMany(
            { sender: req.params.userId, receiver: req.user.id, read: false },
            { read: true }
        );
        res.json({ success: true });
    } catch {
        res.status(400).json({ success: false, message: "Could not update message status." });
    }
});

router.get("/unread-count", auth, async (req, res) => {
    const unread = await Message.countDocuments({ receiver: req.user.id, read: false });
    res.json({ success: true, unread });
});

router.post("/", auth, async (req, res) => {
    try {
        const receiver = String(req.body.receiver || "");
        const text = String(req.body.text || "").trim();

        if (!receiver || !text) {
            return res.status(400).json({ success: false, message: "Receiver and message are required." });
        }
        if (receiver === String(req.user.id)) {
            return res.status(400).json({ success: false, message: "You cannot message yourself." });
        }

        const partner = await User.findById(receiver).select("_id name");
        if (!partner) return res.status(404).json({ success: false, message: "User not found." });

        const message = await Message.create({
            sender: req.user.id,
            receiver,
            text: text.slice(0, 2000),
        });
        const populated = await message.populate("sender receiver", "name email");
        const notification = await Notification.create({
            recipient: receiver,
            sender: req.user.id,
            type: "message",
            message: `New message from ${populated.sender.name}`,
            relatedId: message._id,
        });

        const io = req.app.get("io");
        if (io) {
            io.to(`user:${receiver}`).emit("new_message", populated);
            io.to(`user:${receiver}`).emit("notification", notification);
        }

        res.status(201).json({ success: true, message: populated });
    } catch {
        res.status(500).json({ success: false, message: "Could not send message." });
    }
});

module.exports = router;
