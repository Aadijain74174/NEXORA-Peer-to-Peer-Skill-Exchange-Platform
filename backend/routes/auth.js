const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendEmail } = require("../services/mailer");
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

router.post("/forgot-password", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email });

        // Security: user exist karta hai ya nahi, ye reveal nahi karna
        if (!user) {
            return res.json({
                success: true,
                message:
                    "If an account exists with this email, a password reset link has been generated.",
            });
        }

        // Purane reset tokens delete
        await PasswordResetToken.deleteMany({
            user: user._id,
        });

        // Random token generate
        const rawToken = crypto.randomBytes(32).toString("hex");

        // Token ko database mein hash karke store karenge
        const tokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        // Token 30 minutes ke liye valid
        const expiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await PasswordResetToken.create({
            user: user._id,
            tokenHash,
            expiresAt,
        });

        // Reset password link
        const resetLink =
            `${req.protocol}://${req.get("host")}` +
            `/pages/reset-password.html?token=${rawToken}`;

        // Abhi testing ke liye terminal mein link show hoga
        console.log("=================================");
        console.log("NEXORA PASSWORD RESET LINK");
        console.log(resetLink);
        console.log("=================================");

        await sendEmail({
            to: user.email,
            subject: "Nexora Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Nexora Password Reset</h2>

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your Nexora password.
                    </p>

                    <p>
                        Click the button below to create a new password:
                    </p>

                    <p>
                        <a
                            href="${resetLink}"
                            style="
                                display:inline-block;
                                padding:12px 20px;
                                background:#0d6efd;
                                color:white;
                                text-decoration:none;
                                border-radius:6px;
                            "
                        >
                            Reset Password
                        </a>
                    </p>

                    <p>
                        This link will expire in 30 minutes.
                    </p>

                    <p>
                        If you did not request this password reset, you can ignore this email.
                    </p>

                    <p>
                        Regards,<br>
                        Nexora Team
                    </p>
                </div>
            `,
        });
        
        res.json({
            success: true,
            message:
                "If an account exists with this email, a password reset link has been generated.",
            devResetLink: resetLink,
        });
    } catch (error) {
        console.error("Forgot password error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not process password reset request.",
        });
    }
});

router.post("/reset-password/:token", async (req, res) => {
    try {
        const token = String(req.params.token || "");
        const password = String(req.body.password || "");
        const confirmPassword = String(
            req.body.confirmPassword || ""
        );

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const resetToken = await PasswordResetToken.findOne({
            tokenHash,
            expiresAt: { $gt: new Date() },
        });

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message:
                    "Reset link is invalid or has expired.",
            });
        }

        const user = await User.findById(resetToken.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.password = await bcrypt.hash(password, 10);

        await user.save();

        // Token can only be used once.
        await PasswordResetToken.deleteOne({
            _id: resetToken._id,
        });

        res.json({
            success: true,
            message:
                "Password reset successful. You can now log in with your new password.",
        });
    } catch (error) {
        console.error("Reset password error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not reset password.",
        });
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
