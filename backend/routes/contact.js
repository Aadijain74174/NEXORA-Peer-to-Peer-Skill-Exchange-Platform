const router = require("express").Router();
const ContactMessage = require("../models/ContactMessage");

router.post("/", async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const subject = String(req.body.subject || "").trim();
        const message = String(req.body.message || "").trim();

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message must contain at least 10 characters.",
            });
        }

        const contactMessage = await ContactMessage.create({
            name,
            email,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully.",
            data: contactMessage,
        });
    } catch (error) {
        console.error("Contact form error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to send your message right now.",
        });
    }
});

module.exports = router;