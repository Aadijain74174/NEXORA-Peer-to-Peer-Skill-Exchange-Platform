const mongoose = require("mongoose");

const studyGroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        skill: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },

        level: {
            type: String,
            enum: [
                "Beginner",
                "Intermediate",
                "Advanced",
            ],
            default: "Beginner",
        },

        maxMembers: {
            type: Number,
            min: 2,
            max: 100,
            default: 15,
        },

        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        status: {
            type: String,
            enum: ["Active", "Closed"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);


/*
 * Indexes
 *
 * These indexes help when searching
 * and filtering study groups.
 */

studyGroupSchema.index({
    name: "text",
    skill: "text",
    description: "text",
});

studyGroupSchema.index({
    skill: 1,
    level: 1,
    status: 1,
});

studyGroupSchema.index({
    creator: 1,
});


module.exports = mongoose.model(
    "StudyGroup",
    studyGroupSchema
);