const router = require("express").Router();
const ExchangeRequest = require("../models/ExchangeRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");
const auth = require("../middleware/auth");

async function notify(req, recipient, message, relatedId) {
    const note = await Notification.create({
        recipient,
        sender: req.user.id,
        type: "request",
        relatedId,
        message,
    });
    const io = req.app.get("io");
    if (io) io.to(`user:${recipient}`).emit("notification", note);
    return note;
}

router.post("/", auth, async (req, res) => {
    try {
        const receiver = String(req.body.receiver || "");
        const skillOffered = String(req.body.skillOffered || "").trim();
        const skillWanted = String(req.body.skillWanted || "").trim();
        const message = String(req.body.message || "").trim();

        if (!receiver || !skillOffered || !skillWanted) {
            return res.status(400).json({ success: false, message: "Receiver and both skills are required." });
        }
        if (receiver === String(req.user.id)) {
            return res.status(400).json({ success: false, message: "You cannot request yourself." });
        }

        const target = await User.findById(receiver).select("_id name");
        if (!target) return res.status(404).json({ success: false, message: "Partner not found." });

        const existing = await ExchangeRequest.findOne({
            sender: req.user.id,
            receiver,
            status: "pending",
        });
        if (existing) return res.status(409).json({ success: false, message: "A pending request already exists." });

        const request = await ExchangeRequest.create({
            sender: req.user.id,
            receiver,
            skillOffered,
            skillWanted,
            message: message.slice(0, 500),
        });

        const populated = await request.populate([
            { path: "sender", select: "name email" },
            { path: "receiver", select: "name email" },
        ]);

        await notify(req, receiver, `${populated.sender.name} sent you a skill exchange request.`, request._id);
        res.status(201).json({ success: true, request: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not create request." });
    }
});

router.get("/received", auth, async (req, res) => {
    try {
        const requests = await ExchangeRequest.find({ receiver: req.user.id })
            .populate("sender", "name email teachSkills learnSkills rating reviewCount")
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch {
        res.status(500).json({ success: false, message: "Could not load received requests." });
    }
});

router.get("/sent", auth, async (req, res) => {
    try {
        const requests = await ExchangeRequest.find({ sender: req.user.id })
            .populate("receiver", "name email teachSkills learnSkills rating reviewCount")
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch {
        res.status(500).json({ success: false, message: "Could not load sent requests." });
    }
});

router.put("/:id/accept", auth, async (req, res) => {
    try {
        const request = await ExchangeRequest.findOneAndUpdate(
            { _id: req.params.id, receiver: req.user.id, status: "pending" },
            { status: "accepted" },
            { new: true }
        );
        if (!request) return res.status(404).json({ success: false, message: "Pending request not found." });

        await notify(req, request.sender, "Your skill exchange request was accepted.", request._id);
        res.json({ success: true, request });
    } catch {
        res.status(400).json({ success: false, message: "Could not accept request." });
    }
});

router.put("/:id/reject", auth, async (req, res) => {
    try {
        const request = await ExchangeRequest.findOneAndUpdate(
            { _id: req.params.id, receiver: req.user.id, status: "pending" },
            { status: "rejected" },
            { new: true }
        );
        if (!request) return res.status(404).json({ success: false, message: "Pending request not found." });

        await notify(req, request.sender, "Your skill exchange request was rejected.", request._id);
        res.json({ success: true, request });
    } catch {
        res.status(400).json({ success: false, message: "Could not reject request." });
    }
});

router.put("/:id/cancel", auth, async (req, res) => {
    try {
        const request = await ExchangeRequest.findOneAndUpdate(
            { _id: req.params.id, sender: req.user.id, status: "pending" },
            { status: "cancelled" },
            { new: true }
        );
        if (!request) return res.status(404).json({ success: false, message: "Pending request not found." });
        await notify(req, request.receiver, "A skill exchange request was cancelled.", request._id);
        res.json({ success: true, request });
    } catch {
        res.status(400).json({ success: false, message: "Could not cancel request." });
    }
});

module.exports = router;
