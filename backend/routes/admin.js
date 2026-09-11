const router = require("express").Router();
const User = require("../models/User");
const Session = require("../models/Session");
const ExchangeRequest = require("../models/ExchangeRequest");
const Review = require("../models/Review");
const Report = require("../models/Report");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/overview", auth, admin, async (req, res) => {
    const [users, activeUsers, sessions, completedSessions, pendingRequests, reviews, openReports] = await Promise.all([
        User.countDocuments(), User.countDocuments({ isBlocked: false }), Session.countDocuments(), Session.countDocuments({ status: "Completed" }), ExchangeRequest.countDocuments({ status: "pending" }), Review.countDocuments(), Report.countDocuments({ status: "Open" }),
    ]);
    const topSkills = await User.aggregate([
        { $project: { skills: { $concatArrays: ["$teachSkills", "$learnSkills"] } } },
        { $unwind: "$skills" }, { $group: { _id: "$skills", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 },
    ]);
    res.json({ success: true, stats: { users, activeUsers, sessions, completedSessions, pendingRequests, reviews, openReports }, topSkills });
});

module.exports = router;
