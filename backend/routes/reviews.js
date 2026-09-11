const router = require("express").Router();
const Review = require("../models/Review");
const Session = require("../models/Session");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
    try {
        const reviewedUser = String(req.body.reviewedUser || "");
        const sessionId = String(req.body.session || "");
        const rating = Number(req.body.rating);
        const comment = String(req.body.comment || "").trim().slice(0, 1000);

        if (!reviewedUser || !sessionId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Choose a valid 1–5 star rating." });
        }
        if (reviewedUser === String(req.user.id)) {
            return res.status(400).json({ success: false, message: "You cannot review yourself." });
        }

        const session = await Session.findOne({
            _id: sessionId,
            status: "Completed",
            $or: [{ teacher: req.user.id }, { learner: req.user.id }],
        });
        if (!session) {
            return res.status(400).json({ success: false, message: "Reviews are available only after a completed session." });
        }

        const isPartner = [String(session.teacher), String(session.learner)].includes(reviewedUser);
        if (!isPartner) {
            return res.status(400).json({ success: false, message: "You can only review your session partner." });
        }

        const exists = await Review.findOne({ reviewer: req.user.id, session: sessionId });
        if (exists) return res.status(409).json({ success: false, message: "You already reviewed this session." });

        const review = await Review.create({
            reviewer: req.user.id,
            reviewedUser,
            session: sessionId,
            rating,
            comment,
        });

        const stats = await Review.aggregate([
            { $match: { reviewedUser: session["teacher"].toString() === reviewedUser ? session.teacher : session.learner } },
            { $group: { _id: "$reviewedUser", average: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]);

        const average = stats[0] ? Math.round(stats[0].average * 10) / 10 : rating;
        const count = stats[0]?.count || 1;
        const completed = await Session.countDocuments({
            status: "Completed",
            $or: [{ teacher: reviewedUser }, { learner: reviewedUser }],
        });
        const trustScore = Math.min(100, Math.round(50 + Math.min(25, completed * 2) + (average / 5) * 25));

        await User.findByIdAndUpdate(reviewedUser, {
            rating: average,
            reviewCount: count,
            trustScore,
        });

        const note = await Notification.create({
            recipient: reviewedUser,
            sender: req.user.id,
            type: "review",
            relatedId: review._id,
            message: `You received a ${rating}-star review.`,
        });
        const io = req.app.get("io");
        if (io) io.to(`user:${reviewedUser}`).emit("notification", note);

        res.status(201).json({ success: true, review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "You already reviewed this session." });
        }
        res.status(400).json({ success: false, message: "Could not submit review." });
    }
});

router.get("/session/:sessionId", auth, async (req, res) => {
    try {
        const review = await Review.findOne({ session: req.params.sessionId, reviewer: req.user.id });
        res.json({ success: true, review });
    } catch {
        res.status(400).json({ success: false, message: "Invalid session ID." });
    }
});

router.get("/:userId", auth, async (req, res) => {
    try {
        const reviews = await Review.find({ reviewedUser: req.params.userId })
            .populate("reviewer", "name")
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch {
        res.status(400).json({ success: false, message: "Could not load reviews." });
    }
});

module.exports = router;
