const router = require("express").Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
router.get("/" , auth, async(req, res)=> {
    try {
        const notifications = await Notification.find( {
            recipient: req.user.id
        }
        ).populate("sender" , "name").sort( {
            createdAt: -1
        }
        ).limit(50);
        const unread = await Notification.countDocuments( {
            recipient: req.user.id, read: false
        }
        );
        res.json( {
            success: true, notifications, unread
        }
        );
    } catch {
        res.status(500).json( {
            success: false, message: "Could not load notifications"
        }
        );
    }
}
);
router.put("/:id/read" , auth, async(req, res)=> {
    const n = await Notification.findOneAndUpdate( {
        _id: req.params.id, recipient: req.user.id
    }
    , {
        read: true
    }
    , {
        new: true
    }
    );
    if(!n)return res.status(404).json( {
        success: false, message: "Notification not found"
    }
    );
    res.json( {
        success: true, notification: n
    }
    );
}
);
router.put("/read-all" , auth, async(req, res)=> {
    await Notification.updateMany( {
        recipient: req.user.id, read: false
    }
    , {
        read: true
    }
    );
    res.json( {
        success: true
    }
    );
}
);
module.exports = router;
