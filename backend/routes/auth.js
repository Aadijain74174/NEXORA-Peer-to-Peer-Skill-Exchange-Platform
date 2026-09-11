const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

function tokenFor(user) {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function safeUser(user) {
    const data = user.toObject();
    delete data.password;
    return data;
}

router.post("/register", async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const confirmPassword = String(req.body.confirmPassword || "");

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address." });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match." });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ success: false, message: "Email already registered." });

        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role: process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
        });

        res.status(201).json({ success: true, token: tokenFor(user), user: safeUser(user) });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ success: false, message: "Registration failed." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "This account has been blocked. Please contact Nexora support." });
        }

        res.json({ success: true, token: tokenFor(user), user: safeUser(user) });
    } catch {
        res.status(500).json({ success: false, message: "Login failed." });
    }
});

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, user });
    } catch {
        res.status(401).json({ success: false, message: "Authentication expired. Please log in again." });
    }
});

module.exports = router;
