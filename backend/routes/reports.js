const router = require("express").Router();
const Report = require("../models/Report");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.post("/", auth, async (req, res) => {
    try {
        const reportedUser = String(req.body.reportedUser || "");
        const reason = String(req.body.reason || "");
        const details = String(req.body.details || "").trim().slice(0, 1000);
        if (!reportedUser || reportedUser === String(req.user.id)) return res.status(400).json({ success: false, message: "Choose a valid user to report." });
        if (!(await User.exists({ _id: reportedUser }))) return res.status(404).json({ success: false, message: "User not found." });
        const allowed = ["Spam", "Fake profile", "Inappropriate behaviour", "Misleading skill", "Other"];
        if (!allowed.includes(reason)) return res.status(400).json({ success: false, message: "Choose a valid report reason." });
        const existing = await Report.findOne({ reporter: req.user.id, reportedUser, status: "Open" });
        if (existing) return res.status(409).json({ success: false, message: "You already have an open report for this user." });
        const report = await Report.create({ reporter: req.user.id, reportedUser, reason, details });
        res.status(201).json({ success: true, report });
    } catch { res.status(400).json({ success: false, message: "Could not submit report." }); }
});

router.get("/admin", auth, admin, async (req, res) => {
    const reports = await Report.find().populate("reporter reportedUser", "name email isBlocked").sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, reports });
});

router.put("/admin/:id", auth, admin, async (req, res) => {
    try {
        const status = ["Open", "Reviewed", "Resolved"].includes(req.body.status) ? req.body.status : "Reviewed";
        const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!report) return res.status(404).json({ success: false, message: "Report not found." });
        res.json({ success: true, report });
    } catch { res.status(400).json({ success: false, message: "Could not update report." }); }
});

router.put("/admin/user/:id/block", auth, admin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: Boolean(req.body.blocked) }, { new: true }).select("name email isBlocked");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        await Notification.create({ recipient: user._id, type: "system", message: user.isBlocked ? "Your Nexora account has been blocked by an administrator." : "Your Nexora account has been unblocked." });
        res.json({ success: true, user });
    } catch { res.status(400).json({ success: false, message: "Could not update account status." }); }
});

module.exports = router;
