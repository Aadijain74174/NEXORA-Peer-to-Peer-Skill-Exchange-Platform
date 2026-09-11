const router = require("express").Router();
const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
    const transactions = await CreditTransaction.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100);
    const user = await User.findById(req.user.id).select("skillCredits");
    res.json({ success: true, balance: user?.skillCredits || 0, transactions });
});

router.post("/spend", auth, async (req, res) => {
    try {
        const amount = Math.max(1, Math.floor(Number(req.body.amount) || 0));
        const reason = String(req.body.reason || "Skill exchange").trim().slice(0, 200);
        const user = await User.findOneAndUpdate({ _id: req.user.id, skillCredits: { $gte: amount } }, { $inc: { skillCredits: -amount } }, { new: true });
        if (!user) return res.status(400).json({ success: false, message: "Not enough skill credits." });
        const transaction = await CreditTransaction.create({ user: user._id, amount: -amount, type: "spent", reason });
        res.json({ success: true, balance: user.skillCredits, transaction });
    } catch { res.status(400).json({ success: false, message: "Could not spend credits." }); }
});

module.exports = router;
