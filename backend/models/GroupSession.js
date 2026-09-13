const mongoose = require("mongoose");

const groupSessionSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyGroup",
            required: true,
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        skill: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        date: {
            type: String,
            required: true,
        },

        time: {
            type: String,
            required: true,
        },

        duration: {
            type: Number,
            min: 15,
            max: 240,
            default: 60,
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Online",
        },

        meetingLink: {
            type: String,
            trim: true,
            default: "",
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "Scheduled",
                "Completed",
                "Cancelled",
            ],
            default: "Scheduled",
        },
    },
    {
        timestamps: true,
    }
);


// Fast lookup of sessions belonging to a group
groupSessionSchema.index({
    group: 1,
    date: 1,
    time: 1,
});


// Fast lookup of organizer's sessions
groupSessionSchema.index({
    organizer: 1,
    status: 1,
});


module.exports = mongoose.model(
    "GroupSession",
    groupSessionSchema
);