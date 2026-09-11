const router = require("express").Router();
const Session = require("../models/Session");
const User = require("../models/User");
const Notification = require("../models/Notification");
const CreditTransaction = require("../models/CreditTransaction");
const auth = require("../middleware/auth");

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function notify(req, recipient, message, sessionId) {
    const note = await Notification.create({
        recipient,
        sender: req.user.id,
        type: "session",
        relatedId: sessionId,
        message,
    });
    const io = req.app.get("io");
    if (io) io.to(`user:${recipient}`).emit("notification", note);
}

router.post("/", auth, async (req, res) => {
    try {
        const partner = String(req.body.partner || "").trim();
        const learner = String(req.body.learner || "").trim();
        const teacher = String(req.body.teacher || req.user.id);
        const skill = String(req.body.skill || "").trim();
        const date = String(req.body.date || "").trim();
        const time = String(req.body.time || "").trim();
        const mode = req.body.mode === "Offline" ? "Offline" : "Online";
        const meetingLink = String(req.body.meetingLink || "").trim();
        const duration = Math.max(15, Math.min(240, Number(req.body.duration) || 60));

        if (meetingLink) {
            try {
                const parsedUrl = new URL(meetingLink);
                if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
            } catch {
                return res.status(400).json({ success: false, message: "Meeting link must be a valid http(s) URL." });
            }
        }
        const notes = String(req.body.notes || "").trim().slice(0, 500);

        if (teacher !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "You can only schedule for your own account." });
        }
        if ((!learner && !partner) || !skill || !date || !time) {
            return res.status(400).json({ success: false, message: "Partner, skill, date and time are required." });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
            return res.status(400).json({ success: false, message: "Use a valid session date and time." });
        }
        const today = new Date().toISOString().slice(0, 10);
        if (date < today) {
            return res.status(400).json({ success: false, message: "Session date cannot be in the past." });
        }

        let partnerUser;
        if (learner) {
            partnerUser = await User.findById(learner).select("_id name email");
        } else {
            const safe = escapeRegex(partner);
            partnerUser = await User.findOne({
                _id: { $ne: req.user.id },
                $or: [
                    { email: partner.toLowerCase() },
                    { name: { $regex: `^${safe}$`, $options: "i" } },
                ],
            }).select("_id name email");
        }

        if (!partnerUser) {
            return res.status(404).json({ success: false, message: "Partner not found. Use their registered name or email." });
        }
        if (String(partnerUser._id) === String(req.user.id)) {
            return res.status(400).json({ success: false, message: "You cannot schedule a session with yourself." });
        }

        const conflict = await Session.findOne({
            status: "Scheduled",
            date,
            time,
            $or: [
                { teacher: req.user.id },
                { learner: req.user.id },
                { teacher: partnerUser._id },
                { learner: partnerUser._id },
            ],
        });
        if (conflict) return res.status(409).json({ success: false, message: "One of the participants already has a session at this time." });

        const session = await Session.create({
            teacher: req.user.id,
            learner: partnerUser._id,
            skill,
            date,
            time,
            duration,
            notes,
            mode,
            meetingLink,
        });

        const populated = await session.populate([
            { path: "teacher", select: "name email" },
            { path: "learner", select: "name email" },
        ]);

        await notify(
            req,
            partnerUser._id,
            `${populated.teacher.name} scheduled a ${skill} session with you on ${date} at ${time}.`,
            session._id
        );

        res.status(201).json({ success: true, session: populated });
    } catch (error) {
        console.error("Schedule session error:", error.message);
        res.status(400).json({ success: false, message: error.message || "Could not schedule session." });
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const sessions = await Session.find({
            $or: [{ teacher: req.user.id }, { learner: req.user.id }],
        })
            .populate("teacher learner", "name email")
            .sort({ date: 1, time: 1 });
        res.json({ success: true, sessions });
    } catch {
        res.status(500).json({ success: false, message: "Could not load sessions." });
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            $or: [{ teacher: req.user.id }, { learner: req.user.id }],
        }).populate("teacher learner", "name email teachSkills learnSkills rating reviewCount");

        if (!session) return res.status(404).json({ success: false, message: "Session not found or access denied." });
        res.json({ success: true, session });
    } catch {
        res.status(400).json({ success: false, message: "Invalid session ID." });
    }
});

router.put("/:id/complete", auth, async (req, res) => {
    try {
        const session = await Session.findOneAndUpdate(
            {
                _id: req.params.id,
                status: "Scheduled",
                $or: [{ teacher: req.user.id }, { learner: req.user.id }],
            },
            { status: "Completed" },
            { new: true }
        );

        if (!session) return res.status(404).json({ success: false, message: "Scheduled session not found." });

        await Promise.all([
            User.findByIdAndUpdate(session.teacher, { $inc: { skillCredits: 10 } }),
            User.findByIdAndUpdate(session.learner, { $inc: { skillCredits: 5 } }),
            CreditTransaction.create({ user: session.teacher, amount: 10, type: "earned", reason: `Taught ${session.skill}`, relatedSession: session._id }),
            CreditTransaction.create({ user: session.learner, amount: 5, type: "earned", reason: `Completed ${session.skill} learning session`, relatedSession: session._id }),
        ]);

        const participants = [session.teacher, session.learner];
        for (const userId of participants) {
            const [completed, user] = await Promise.all([
                Session.countDocuments({
                    status: "Completed",
                    $or: [{ teacher: userId }, { learner: userId }],
                }),
                User.findById(userId).select("rating"),
            ]);
            const ratingPart = user?.rating ? (Number(user.rating) / 5) * 25 : 0;
            const trustScore = Math.min(100, Math.round(50 + Math.min(25, completed * 2) + ratingPart));
            await User.findByIdAndUpdate(userId, { trustScore });
        }

        const populated = await session.populate("teacher learner", "name email");
        const otherUser = String(populated.teacher._id) === String(req.user.id)
            ? populated.learner._id
            : populated.teacher._id;

        await notify(
            req,
            otherUser,
            `${populated.skill} session was marked completed. You can now leave a review.`,
            session._id
        );

        res.json({ success: true, session: populated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Could not complete session." });
    }
});

router.put("/:id/cancel", auth, async (req, res) => {
    try {
        const session = await Session.findOneAndUpdate(
            {
                _id: req.params.id,
                status: "Scheduled",
                $or: [{ teacher: req.user.id }, { learner: req.user.id }],
            },
            { status: "Cancelled" },
            { new: true }
        ).populate("teacher learner", "name email");

        if (!session) return res.status(404).json({ success: false, message: "Scheduled session not found." });

        const otherUser = String(session.teacher._id) === String(req.user.id)
            ? session.learner._id
            : session.teacher._id;

        await notify(req, otherUser, `The ${session.skill} session on ${session.date} at ${session.time} was cancelled.`, session._id);
        res.json({ success: true, session });
    } catch {
        res.status(400).json({ success: false, message: "Could not cancel session." });
    }
});

module.exports = router;
