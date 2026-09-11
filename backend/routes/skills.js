const router = require("express").Router();
const Skill = require("../models/Skill");
const auth = require("../middleware/auth");
router.get("/" , auth, async(req, res)=> {
    const skills = await Skill.find().sort( {
        name: 1
    }
    );
    res.json( {
        success: true, skills
    }
    );
}
);
router.post("/" , auth, async(req, res)=> {
    try {
        const name = String(req.body.name || "").trim();
        const category = String(req.body.category || "Other").trim();
        if(!name)return res.status(400).json( {
            success: false, message: "Skill name is required"
        }
        );
        const skill = await Skill.findOneAndUpdate( {
            name: {
                $regex: `^${name}$` , $options: "i"
            }
        }
        , {
            name, category
        }
        , {
            new: true, upsert: true, setDefaultsOnInsert: true
        }
        );
        res.status(201).json( {
            success: true, skill
        }
        );
    } catch {
        res.status(500).json( {
            success: false, message: "Could not save skill"
        }
        );
    }
}
);
module.exports = router;
