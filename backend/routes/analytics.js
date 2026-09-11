const router = require("express").Router();
const auth = require("../middleware/auth");
const Session = require("../models/Session");
const ExchangeRequest = require("../models/ExchangeRequest");
const Review = require("../models/Review");
const User = require("../models/User");

router.get("/me", auth, async (req, res) => {
    const id = req.user.id;
    const [sessions, requests, reviews, user] = await Promise.all([
        Session.find({ $or: [{ teacher: id }, { learner: id }] }).select("status date"),
        ExchangeRequest.find({ $or: [{ sender: id }, { receiver: id }] }).select("status createdAt"),
        Review.find({ reviewer: id }).select("rating createdAt"),
        User.findById(id).select("teachSkills learnSkills skillCredits rating trustScore learningGoals"),
    ]);
    const months = Array.from({ length: 6 }, (_, index) => { const d = new Date(); d.setMonth(d.getMonth() - (5 - index)); return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en", { month: "short" }), sessions: 0 }; });
    sessions.filter((s) => s.status === "Completed").forEach((s) => { const bucket = months.find((m) => m.key === String(s.date).slice(0, 7)); if (bucket) bucket.sessions += 1; });
    res.json({ success: true, analytics: { sessionsCompleted: sessions.filter((s) => s.status === "Completed").length, sessionsScheduled: sessions.filter((s) => s.status === "Scheduled").length, requestsSent: requests.filter((r) => String(r.sender) === id).length, requestsAccepted: requests.filter((r) => r.status === "accepted").length, reviewsGiven: reviews.length, averageGiven: reviews.length ? Math.round(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length * 10) / 10 : 0, skillCount: new Set([...(user?.teachSkills || []), ...(user?.learnSkills || [])]).size, goalsCompleted: (user?.learningGoals || []).filter((g) => g.status === "Completed").length, credits: user?.skillCredits || 0, rating: user?.rating || 0, trustScore: user?.trustScore || 50, monthly: months } });
});

module.exports = router;
