const router = require("express").Router();

const GroupMessage = require("../models/GroupMessage");
const StudyGroup = require("../models/StudyGroup");

const auth = require("../middleware/auth");


/*
 * GET GROUP MESSAGES
 * Returns recent messages for a study group.
 */
router.get("/:groupId", auth, async (req, res) => {
    try {
        const group = await StudyGroup.findById(
            req.params.groupId
        );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Study group not found.",
            });
        }


        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user.id
        );


        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "Only group members can view group messages.",
            });
        }


        const messages = await GroupMessage.find({
            group: req.params.groupId,
        })
            .populate("sender", "name email")
            .sort({ createdAt: 1 })
            .limit(200);


        res.json({
            success: true,
            count: messages.length,
            data: messages,
        });

    } catch (error) {
        console.error(
            "Get group messages error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load group messages.",
        });
    }
});


/*
 * SEND GROUP MESSAGE
 */
router.post("/:groupId", auth, async (req, res) => {
    try {
        const text = String(
            req.body.text || ""
        ).trim();


        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty.",
            });
        }


        if (text.length > 2000) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot exceed 2000 characters.",
            });
        }


        const group = await StudyGroup.findById(
            req.params.groupId
        );


        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Study group not found.",
            });
        }


        if (group.status !== "Active") {
            return res.status(400).json({
                success: false,
                message:
                    "This study group is closed.",
            });
        }


        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user.id
        );


        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "Only group members can send messages.",
            });
        }


        const message = await GroupMessage.create({
            group: group._id,
            sender: req.user.id,
            text,
        });


        await message.populate(
            "sender",
            "name email"
        );


        res.status(201).json({
            success: true,
            message:
                "Group message sent successfully.",
            data: message,
        });

    } catch (error) {
        console.error(
            "Send group message error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to send group message.",
        });
    }
});

router.delete("/:groupId/:messageId", auth, async (req, res) => {
    try {
        const { groupId, messageId } = req.params;

        const group = await StudyGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Study group not found.",
            });
        }

        const isMember = group.members.some(
            (memberId) =>
                String(memberId) === String(req.user.id)
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "Only group members can delete messages.",
            });
        }

        const message = await GroupMessage.findOne({
            _id: messageId,
            group: groupId,
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Group message not found.",
            });
        }

        // Sirf message bhejne wala delete kar sakta hai
        if (
            String(message.sender) !==
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
            io.to(`group:${groupId}`).emit(
                "group_message_deleted",
                {
                    messageId: message._id,
                    text: "This message was deleted.",
                }
            );
        }

        res.json({
            success: true,
            message: "Group message deleted successfully.",
            data: {
                messageId: message._id,
                deleted: true,
                text: "This message was deleted.",
            },
        });
    } catch (error) {
        console.error(
            "Delete group message error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Could not delete group message.",
        });
    }
});

module.exports = router;