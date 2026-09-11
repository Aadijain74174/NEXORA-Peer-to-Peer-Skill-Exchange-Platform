const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

const normalize = (value) => String(value || "").trim().toLowerCase();

function calculateMatch(me, other) {
    const teach = new Set((me.teachSkills || []).map(normalize));
    const learn = new Set((me.learnSkills || []).map(normalize));
    const otherTeach = new Set((other.teachSkills || []).map(normalize));
    const otherLearn = new Set((other.learnSkills || []).map(normalize));

    const skillsTheyCanTeachMe = [...learn].filter((skill) => otherTeach.has(skill));
    const skillsICanTeachThem = [...teach].filter((skill) => otherLearn.has(skill));

    if (!skillsTheyCanTeachMe.length && !skillsICanTeachThem.length) {
        return { score: 0, skillsTheyCanTeachMe, skillsICanTeachThem };
    }

    let score = 0;
    if (learn.size) score += Math.min(40, (skillsTheyCanTeachMe.length / learn.size) * 40);
    if (teach.size) score += Math.min(30, (skillsICanTeachThem.length / teach.size) * 30);
    if (me.experienceLevel === other.experienceLevel) score += 10;
    if (me.availability === other.availability) score += 10;
    if (other.rating) score += Math.min(10, Number(other.rating) * 2);

    const reasons = [];
    if (skillsTheyCanTeachMe.length) reasons.push(`They teach ${skillsTheyCanTeachMe.slice(0, 3).join(", ")}, which you want to learn.`);
    if (skillsICanTeachThem.length) reasons.push(`You can teach ${skillsICanTeachThem.slice(0, 3).join(", ")}, which they want.`);
    if (me.experienceLevel === other.experienceLevel) reasons.push("You have matching experience levels.");
    if (me.availability === other.availability) reasons.push(`You both prefer ${me.availability.toLowerCase()} availability.`);
    if (other.rating >= 4) reasons.push("This partner has a strong community rating.");

    return {
        score: Math.min(100, Math.round(score)),
        skillsTheyCanTeachMe,
        skillsICanTeachThem,
        reasons,
    };
}

router.get("/", auth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id).select("-password");
        if (!me) return res.status(404).json({ success: false, message: "User not found." });

        const users = await User.find({ _id: { $ne: req.user.id } })
            .select("-password")
            .limit(100);

        const matches = users
            .map((user) => ({ user, ...calculateMatch(me, user) }))
            .filter((match) => match.score > 0)
            .sort((a, b) => b.score - a.score);

        res.json({ success: true, matches });
    } catch {
        res.status(500).json({ success: false, message: "Could not calculate matches." });
    }
});

module.exports = router;
