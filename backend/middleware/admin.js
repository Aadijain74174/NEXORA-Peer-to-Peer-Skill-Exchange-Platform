const User = require("../models/User");

module.exports = async function admin(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select("role isBlocked email");
        const configuredAdmin = process.env.ADMIN_EMAIL && user?.email === process.env.ADMIN_EMAIL.toLowerCase();
        if (!user || user.isBlocked || (user.role !== "admin" && !configuredAdmin)) {
            return res.status(403).json({ success: false, message: "Administrator access required." });
        }
        req.admin = user;
        next();
    } catch {
        res.status(403).json({ success: false, message: "Administrator access required." });
    }
};
