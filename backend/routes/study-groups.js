const router = require("express").Router();

const StudyGroup = require("../models/StudyGroup");
const User = require("../models/User");

const auth = require("../middleware/auth");


/*
 * ============================================================
 * CREATE STUDY GROUP
 * ============================================================
 *
 * POST /api/study-groups
 *
 * Creates a new study group.
 * The creator automatically becomes the first member.
 */

router.post("/", auth, async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        const skill = String(req.body.skill || "").trim();
        const description = String(
            req.body.description || ""
        ).trim();

        const level = String(
            req.body.level || "Beginner"
        ).trim();

        const maxMembers = Number(
            req.body.maxMembers || 15
        );

        if (!name || !skill) {
            return res.status(400).json({
                success: false,
                message: "Group name and skill are required.",
            });
        }

        if (name.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Group name must contain at least 3 characters.",
            });
        }

        if (maxMembers < 2 || maxMembers > 100) {
            return res.status(400).json({
                success: false,
                message:
                    "Maximum members must be between 2 and 100.",
            });
        }

        const studyGroup = await StudyGroup.create({
            name,
            skill,
            description,
            level,
            maxMembers,
            creator: req.user.id,
            members: [req.user.id],
        });

        await studyGroup.populate(
            "creator",
            "name email"
        );

        res.status(201).json({
            success: true,
            message: "Study group created successfully.",
            data: studyGroup,
        });

    } catch (error) {
        console.error(
            "Create study group error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to create study group.",
        });
    }
});


/*
 * ============================================================
 * GET ALL STUDY GROUPS
 * ============================================================
 *
 * GET /api/study-groups
 *
 * Returns active study groups.
 */

router.get("/", async (req, res) => {
    try {
        const groups = await StudyGroup.find({
            status: "Active",
        })
            .populate(
                "creator",
                "name email"
            )
            .populate(
                "members",
                "name email"
            )
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            count: groups.length,
            data: groups,
        });

    } catch (error) {
        console.error(
            "Get study groups error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to load study groups.",
        });
    }
});


/*
 * ============================================================
 * SEARCH STUDY GROUPS
 * ============================================================
 *
 * GET /api/study-groups/search?q=javascript
 *
 * Searches by group name, skill or description.
 */

router.get("/search", async (req, res) => {
    try {
        const query = String(
            req.query.q || ""
        ).trim();

        if (!query) {
            return res.json({
                success: true,
                count: 0,
                data: [],
            });
        }

        const groups = await StudyGroup.find(
            {
                $text: {
                    $search: query,
                },
                status: "Active",
            },
            {
                score: {
                    $meta: "textScore",
                },
            }
        )
            .populate(
                "creator",
                "name email"
            )
            .sort({
                score: {
                    $meta: "textScore",
                },
            });

        res.json({
            success: true,
            count: groups.length,
            data: groups,
        });

    } catch (error) {
        console.error(
            "Search study groups error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to search study groups.",
        });
    }
});


/*
 * ============================================================
 * GET MY STUDY GROUPS
 * ============================================================
 *
 * GET /api/study-groups/my
 *
 * Returns groups where the current user is a member.
 */

router.get("/my", auth, async (req, res) => {
    try {
        const groups = await StudyGroup.find({
            members: req.user.id,
        })
            .populate(
                "creator",
                "name email"
            )
            .populate(
                "members",
                "name email"
            )
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            count: groups.length,
            data: groups,
        });

    } catch (error) {
        console.error(
            "Get my study groups error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to load your study groups.",
        });
    }
});


/*
 * ============================================================
 * GET SINGLE STUDY GROUP
 * ============================================================
 *
 * GET /api/study-groups/:id
 */

router.get("/:id", async (req, res) => {
    try {
        const group = await StudyGroup.findById(
            req.params.id
        )
            .populate(
                "creator",
                "name email"
            )
            .populate(
                "members",
                "name email"
            );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Study group not found.",
            });
        }

        res.json({
            success: true,
            data: group,
        });

    } catch (error) {
        console.error(
            "Get study group error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to load study group.",
        });
    }
});


/*
 * ============================================================
 * JOIN STUDY GROUP
 * ============================================================
 *
 * POST /api/study-groups/:id/join
 */

router.post("/:id/join", auth, async (req, res) => {
    try {
        const group = await StudyGroup.findById(
            req.params.id
        );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Study group not found.",
            });
        }

        if (group.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "This study group is closed.",
            });
        }

        const alreadyMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user.id
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this group.",
            });
        }

        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({
                success: false,
                message: "This study group is full.",
            });
        }

        group.members.push(req.user.id);

        await group.save();

        await group.populate(
            "members",
            "name email"
        );

        res.json({
            success: true,
            message: "You joined the study group successfully.",
            data: group,
        });

    } catch (error) {
        console.error(
            "Join study group error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to join study group.",
        });
    }
});


/*
 * ============================================================
 * LEAVE STUDY GROUP
 * ============================================================
 *
 * POST /api/study-groups/:id/leave
 */

router.post("/:id/leave", auth, async (req, res) => {
    try {
        const group = await StudyGroup.findById(
            req.params.id
        );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Study group not found.",
            });
        }

        if (
            group.creator.toString() ===
            req.user.id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "The group creator cannot leave the group.",
            });
        }

        const memberIndex = group.members.findIndex(
            (memberId) =>
                memberId.toString() === req.user.id
        );

        if (memberIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "You are not a member of this group.",
            });
        }

        group.members.splice(
            memberIndex,
            1
        );

        await group.save();

        res.json({
            success: true,
            message: "You left the study group.",
        });

    } catch (error) {
        console.error(
            "Leave study group error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to leave study group.",
        });
    }
});


/*
 * ============================================================
 * CLOSE STUDY GROUP
 * ============================================================
 *
 * POST /api/study-groups/:id/close
 *
 * Only the creator can close the group.
 */

router.post("/:id/close", auth, async (req, res) => {
    try {
        const group = await StudyGroup.findById(
            req.params.id
        );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Study group not found.",
            });
        }

        if (
            group.creator.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the group creator can close this group.",
            });
        }

        group.status = "Closed";

        await group.save();

        res.json({
            success: true,
            message: "Study group closed successfully.",
            data: group,
        });

    } catch (error) {
        console.error(
            "Close study group error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to close study group.",
        });
    }
});


module.exports = router;