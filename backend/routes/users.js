const router = require("express").Router();
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Session = require("../models/Session");
const ExchangeRequest = require("../models/ExchangeRequest");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
// Profile photo upload configuration
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG and WEBP images are allowed."));
        }

        cb(null, true);
    },
});

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanSkills(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map((skill) => String(skill).trim()).filter(Boolean))].slice(0, 30);
}

router.get("/", auth, async (req, res) => {
    try {
        const { skill, experienceLevel, availability, rating } = req.query;
        const query = { _id: { $ne: req.user.id } };

        if (experienceLevel && experienceLevel !== "All") {
            query.experienceLevel = experienceLevel;
        }

        if (availability && availability !== "All") {
            query.availability = availability;
        }

        if (rating && Number(rating) > 0) {
            query.rating = { $gte: Number(rating) };
        }

        if (skill?.trim()) {
            const safeSkill = escapeRegex(skill.trim());
            query.$or = [
                { name: { $regex: safeSkill, $options: "i" } },
                { teachSkills: { $regex: safeSkill, $options: "i" } },
                { learnSkills: { $regex: safeSkill, $options: "i" } },
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ rating: -1, reviewCount: -1, name: 1 })
            .limit(50);

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not load users." });
    }
});

router.get("/stats/overview", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [sessionsCompleted, upcomingSessions, pendingReceived, pendingSent, reviewsReceived] =
            await Promise.all([
                Session.countDocuments({
                    status: "Completed",
                    $or: [{ teacher: userId }, { learner: userId }],
                }),
                Session.countDocuments({
                    status: "Scheduled",
                    $or: [{ teacher: userId }, { learner: userId }],
                }),
                ExchangeRequest.countDocuments({ receiver: userId, status: "pending" }),
                ExchangeRequest.countDocuments({ sender: userId, status: "pending" }),
                Review.countDocuments({ reviewedUser: userId }),
            ]);

        res.json({
            success: true,
            stats: {
                sessionsCompleted,
                upcomingSessions,
                pendingRequests: pendingReceived + pendingSent,
                reviewsReceived,
            },
        });
    } catch {
        res.status(500).json({ success: false, message: "Could not load profile statistics." });
    }
});

// Upload profile photo
router.post("/:id/profile-photo", auth, (req, res, next) => {
    upload.single("profilePhoto")(req, res, (error) => {
        if (error) {
            const message =
                error.code === "LIMIT_FILE_SIZE"
                    ? "Image size must be less than 5 MB."
                    : error.message;

            return res.status(400).json({
                success: false,
                message,
            });
        }

        next();
    });
}, async (req, res) => {
    try {
        // User can upload only their own profile photo
        if (String(req.user.id) !== String(req.params.id)) {
            if (req.file) fs.unlinkSync(req.file.path);

            return res.status(403).json({
                success: false,
                message: "You can only update your own profile photo.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a photo.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                profileImage: `/uploads/${req.file.filename}`,
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        if (!user) {
            fs.unlinkSync(req.file.path);

            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            message: "Profile photo uploaded successfully.",
            user,
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: "Could not upload profile photo.",
        });
    }
});
router.get("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, user });
    } catch {
        res.status(400).json({ success: false, message: "Invalid user ID." });
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        if (String(req.user.id) !== String(req.params.id)) {
            return res.status(403).json({ success: false, message: "You can only edit your own profile." });
        }

        const allowed = [
            "name",
            "bio",
            "location",
            "education",
            "experienceLevel",
            "availability",
            "availabilitySlots",
            "teachSkills",
            "learnSkills",
        ];
        const update = {};

        for (const key of allowed) {
            if (req.body[key] !== undefined) update[key] = req.body[key];
        }

        if (update.name !== undefined) update.name = String(update.name).trim();
        if (!update.name) return res.status(400).json({ success: false, message: "Name is required." });
        if (update.teachSkills !== undefined) update.teachSkills = cleanSkills(update.teachSkills);
        if (update.learnSkills !== undefined) update.learnSkills = cleanSkills(update.learnSkills);
        if (update.availabilitySlots !== undefined) {
            if (!Array.isArray(update.availabilitySlots)) return res.status(400).json({ success: false, message: "Availability must be a list of time slots." });
            update.availabilitySlots = update.availabilitySlots.slice(0, 14).map((slot) => ({
                day: String(slot.day || ""),
                start: String(slot.start || ""),
                end: String(slot.end || ""),
            }));
        }

        const user = await User.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        }).select("-password");

        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Could not update profile." });
    }
});

router.get("/me/achievements", auth, async (req, res) => {
    try {
        const [user, completed, reviews, taught] = await Promise.all([
            User.findById(req.user.id).select("teachSkills learnSkills learningGoals trustScore"),
            Session.countDocuments({ status: "Completed", $or: [{ teacher: req.user.id }, { learner: req.user.id }] }),
            Review.countDocuments({ reviewedUser: req.user.id }),
            Session.countDocuments({ status: "Completed", teacher: req.user.id }),
        ]);
        const achievements = [
            { id: "first-exchange", icon: "🏅", title: "First Exchange", description: "Completed your first skill exchange.", unlocked: completed >= 1 },
            { id: "knowledge-sharer", icon: "🔥", title: "Knowledge Sharer", description: "Completed 5 teaching sessions.", unlocked: taught >= 5 },
            { id: "community-favorite", icon: "⭐", title: "Community Favorite", description: "Received 5 reviews from partners.", unlocked: reviews >= 5 },
            { id: "skill-builder", icon: "🚀", title: "Skill Builder", description: "Created 3 learning goals.", unlocked: (user?.learningGoals || []).length >= 3 },
            { id: "trusted-peer", icon: "🛡️", title: "Trusted Peer", description: "Reached a trust score of 80 or higher.", unlocked: (user?.trustScore || 0) >= 80 },
            { id: "skill-mentor", icon: "🎓", title: "Skill Mentor", description: "Added 5 skills you can teach.", unlocked: (user?.teachSkills || []).length >= 5 },
        ];
        res.json({ success: true, achievements });
    } catch { res.status(500).json({ success: false, message: "Could not load achievements." }); }
});

router.get("/me/goals", auth, async (req, res) => {
    const user = await User.findById(req.user.id).select("learningGoals");
    res.json({ success: true, goals: user?.learningGoals || [] });
});

router.post("/me/goals", auth, async (req, res) => {
    try {
        const title = String(req.body.title || "").trim();
        if (!title) return res.status(400).json({ success: false, message: "Goal title is required." });

        const user = await User.findById(req.user.id);
        user.learningGoals.push({
            title,
            skill: String(req.body.skill || "").trim(),
            targetDate: req.body.targetDate || "",
        });
        await user.save();

        res.status(201).json({
            success: true,
            goal: user.learningGoals[user.learningGoals.length - 1],
        });
    } catch {
        res.status(500).json({ success: false, message: "Could not create learning goal." });
    }
});

router.put("/me/goals/:goalId", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const goal = user.learningGoals.id(req.params.goalId);
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found." });

        if (req.body.title !== undefined) goal.title = String(req.body.title).trim();
        if (req.body.skill !== undefined) goal.skill = String(req.body.skill).trim();
        if (req.body.targetDate !== undefined) goal.targetDate = req.body.targetDate;
        if (req.body.progress !== undefined) {
            goal.progress = Math.max(0, Math.min(100, Number(req.body.progress)));
            goal.status = goal.progress >= 100 ? "Completed" : "Active";
        }

        await user.save();
        res.json({ success: true, goal });
    } catch {
        res.status(400).json({ success: false, message: "Could not update learning goal." });
    }
});

router.delete("/me/goals/:goalId", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const goal = user.learningGoals.id(req.params.goalId);
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found." });
        goal.deleteOne();
        await user.save();
        res.json({ success: true });
    } catch {
        res.status(400).json({ success: false, message: "Could not delete learning goal." });
    }
});

module.exports = router;
