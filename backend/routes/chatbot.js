const router = require("express").Router();
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");
const Session = require("../models/Session");
const ExchangeRequest = require("../models/ExchangeRequest");
const SupportTicket = require("../models/SupportTicket");

/* ---------- FAQ LIST: edit or add answers here ---------- */
// keywords: words the user may type (English / Hindi / Hinglish).
// The FAQ with the most matching keywords is used.
const FAQS = [
    {
        keywords: ["hi", "hello", "hey", "namaste", "hii"],
        answer: "Hi! 👋 I'm Nexora Assistant. Ask me about credits, sessions, requests, password, reporting or your account.",
    },
    {
        keywords: ["password", "forgot", "reset", "bhul", "login nahi", "cant login", "can't login"],
        answer: "To reset your password: go to the Login page, click \"Forgot password\", enter your email and open the reset link we send you. Check your spam folder if you don't see it.",
    },
    {
        keywords: ["register", "sign up", "signup", "create account", "account banana", "new account"],
        answer: "To create an account, open the Register page and enter your name, email and password. New users start with 3 skill credits.",
    },
    {
        keywords: ["credit", "credits", "skill credit", "points"],
        answer: "Skill credits are earned and spent through skill exchanges. New users start with 3 credits. Open the Credits page to see your balance and full transaction history (earned, spent, adjustment).",
    },
    {
        keywords: ["session", "book", "schedule", "class", "meeting", "slot"],
        answer: "To schedule a session: open the Sessions page, enter your partner's name or email, choose date, time, duration (15-240 min) and mode (Online/Offline), then save. Online sessions can be joined from the Session Room using \"Join Session\".",
    },
    {
        keywords: ["cancel session", "cancel", "reschedule"],
        answer: "You can cancel a scheduled session from the Sessions page. For a pending exchange request, the sender can cancel it from the Requests page.",
    },
    {
        keywords: ["request", "exchange", "accept", "reject", "pending"],
        answer: "To exchange skills, send a request offering one skill and asking for another. The receiver can accept or reject it, and you can cancel it while it is pending. Check the Requests page for the status.",
    },
    {
        keywords: ["match", "matches", "partner", "find", "search", "explore"],
        answer: "Open the Matches page to see suggested partners based on skills you can teach and want to learn, with a compatibility score. You can also search on the Find Skills page.",
    },
    {
        keywords: ["profile", "skill add", "add skill", "edit profile", "bio", "availability"],
        answer: "Open your Profile page to add skills you can teach and want to learn, your bio, location, experience level and weekly availability.",
    },
    {
        keywords: ["report", "fake", "spam", "abuse", "harass", "inappropriate", "misbehave"],
        answer: "You can report a user from their profile (reasons: Spam, Fake profile, Inappropriate behaviour, Misleading skill, Other). Our admins review every report. If you feel unsafe, please talk to a human below.",
        escalate: true,
    },
    {
        keywords: ["block", "blocked", "suspend", "ban"],
        answer: "Only an admin can review a blocked account, so I'll connect you with our team.",
        escalate: true,
    },
    {
        keywords: ["chat", "message", "delete message", "group", "study group"],
        answer: "You can chat one-to-one with other users from the Chat page, and delete your own messages. Study Groups have group chat for members only, and closed groups don't accept new messages.",
    },
    {
        keywords: ["notification", "bell", "alert"],
        answer: "Click the bell icon in the top navbar to see your notifications. Unread ones show a count.",
    },
    {
        keywords: ["review", "rating", "trust", "trust score"],
        answer: "After eligible sessions you can rate and review your partner. Ratings and reviews affect the trust score (0-100).",
    },
    {
        keywords: ["calendar"],
        answer: "The Calendar page shows your scheduled sessions month by month.",
    },
    {
        keywords: ["contact", "support", "help", "admin", "human", "agent", "complaint"],
        answer: "You can click \"Talk to a human\" below to create a support ticket, or use the Contact Us page. Our team will reply by email.",
        escalate: true,
    },
    {
        keywords: ["thanks", "thank you", "thx", "shukriya", "dhanyavad"],
        answer: "You're welcome! 😊 Let me know if you need anything else.",
    },
];

const FALLBACK =
    "Sorry, I'm not sure about that one. Click \"Talk to a human\" below and our team will help you by email.";

/* ---------- helpers ---------- */

function optionalAuth(req, res, next) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
        try {
            req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
        } catch {
            req.user = null;
        }
    }
    next();
}

const hits = new Map();
function rateLimit(req, res, next) {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < 60000);
    if (recent.length >= 15) {
        return res.status(429).json({
            success: false,
            message: "You are sending messages too fast. Please wait a minute.",
        });
    }
    recent.push(now);
    hits.set(key, recent);
    next();
}

function cleanMessages(input) {
    if (!Array.isArray(input)) return [];
    const msgs = input
        .filter((m) => m && (m.role === "user" || m.role === "assistant"))
        .map((m) => ({ role: m.role, content: String(m.content || "").trim().slice(0, 1000) }))
        .filter((m) => m.content)
        .slice(-10);
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    return msgs;
}

function findFaq(text) {
    let best = null;
    let bestScore = 0;
    for (const faq of FAQS) {
        let score = 0;
        for (const word of faq.keywords) {
            if (word.length <= 3) {
                // short words must match as whole words (so "hi" doesn't match "this")
                if (new RegExp("\\b" + word + "\\b").test(text)) score += 1;
            } else if (text.includes(word)) {
                score += 2;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            best = faq;
        }
    }
    return best;
}

// Answers about the logged-in user's own account.
async function accountAnswer(text, userId) {
    const personal = /\b(my|mine|mera|meri|mere|kitne|kitna|balance|how many|how much)\b/.test(text);
    if (!personal) return null;

    const wantsCredits = text.includes("credit");
    const wantsSessions = text.includes("session");
    const wantsRequests = text.includes("request");
    if (!wantsCredits && !wantsSessions && !wantsRequests) return null;

    if (!userId) {
        return { reply: "Please log in first so I can check your account details.", escalate: false };
    }

    const parts = [];
    if (wantsCredits) {
        const user = await User.findById(userId).select("skillCredits");
        if (user) parts.push(`You currently have ${user.skillCredits} skill credit(s).`);
    }
    if (wantsSessions) {
        const today = new Date().toISOString().slice(0, 10);
        const count = await Session.countDocuments({
            $or: [{ teacher: userId }, { learner: userId }],
            status: "Scheduled",
            date: { $gte: today },
        });
        parts.push(`You have ${count} upcoming scheduled session(s).`);
    }
    if (wantsRequests) {
        const [sent, received] = await Promise.all([
            ExchangeRequest.countDocuments({ sender: userId, status: "pending" }),
            ExchangeRequest.countDocuments({ receiver: userId, status: "pending" }),
        ]);
        parts.push(`You have ${sent} pending request(s) sent and ${received} waiting for your reply.`);
    }
    return { reply: parts.join(" "), escalate: false };
}

/* ---------- POST /api/chatbot ---------- */

router.post("/", optionalAuth, rateLimit, async (req, res) => {
    try {
        const messages = cleanMessages(req.body.messages);
        const last = messages[messages.length - 1];
        if (!last || last.role !== "user") {
            return res.status(400).json({ success: false, message: "Please type a message." });
        }

        const text = last.content.toLowerCase();

        const personal = await accountAnswer(text, req.user?.id);
        if (personal) return res.json({ success: true, ...personal });

        const faq = findFaq(text);
        if (faq) {
            return res.json({ success: true, reply: faq.answer, escalate: !!faq.escalate });
        }

        res.json({ success: true, reply: FALLBACK, escalate: true });
    } catch (error) {
        console.error("Chatbot error:", error.message);
        res.status(500).json({
            success: false,
            message: "The assistant is unavailable right now. Please try again.",
        });
    }
});

/* ---------- POST /api/chatbot/ticket ---------- */

router.post("/ticket", optionalAuth, rateLimit, async (req, res) => {
    try {
        const messages = cleanMessages(req.body.messages);
        let name = "";
        let email = String(req.body.email || "").trim().toLowerCase();
        let userId = null;

        if (req.user?.id) {
            const user = await User.findById(req.user.id).select("name email");
            if (user) {
                userId = user._id;
                name = user.name;
                email = user.email;
            }
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required so we can reply to you.",
            });
        }

        const firstUserMsg = messages.find((m) => m.role === "user")?.content || "Support request";
        const subject = String(req.body.subject || firstUserMsg).trim().slice(0, 150);
        const summary = messages
            .filter((m) => m.role === "user")
            .map((m) => m.content)
            .join(" | ")
            .slice(0, 2000);

        const ticket = await SupportTicket.create({
            user: userId,
            name,
            email,
            subject,
            summary,
            transcript: messages,
        });

        try {
            if (process.env.MAIL_USER && process.env.ADMIN_EMAIL) {
                const { sendEmail } = require("../services/mailer");
                await sendEmail({
                    to: process.env.ADMIN_EMAIL,
                    subject: `New Nexora support ticket: ${subject}`,
                    html: `<p><b>From:</b> ${email}</p><p><b>Summary:</b></p><p>${summary
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")}</p>`,
                });
            }
        } catch (mailError) {
            console.error("Ticket email failed:", mailError.message);
        }

        res.status(201).json({
            success: true,
            message: "Your support ticket has been created. Our team will contact you by email.",
            ticketId: ticket._id,
        });
    } catch (error) {
        console.error("Ticket error:", error.message);
        res.status(500).json({ success: false, message: "Could not create the ticket." });
    }
});

/* ---------- Admin: list and update tickets ---------- */

router.get("/tickets", auth, admin, async (req, res) => {
    const filter = req.query.status ? { status: req.query.status } : {};
    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, tickets });
});

router.patch("/tickets/:id", auth, admin, async (req, res) => {
    try {
        const update = {};
        if (["Open", "In Progress", "Resolved"].includes(req.body.status)) {
            update.status = req.body.status;
        }
        if (typeof req.body.adminNote === "string") {
            update.adminNote = req.body.adminNote.trim().slice(0, 1000);
        }
        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found." });
        res.json({ success: true, ticket });
    } catch {
        res.status(400).json({ success: false, message: "Could not update the ticket." });
    }
});

module.exports = router;