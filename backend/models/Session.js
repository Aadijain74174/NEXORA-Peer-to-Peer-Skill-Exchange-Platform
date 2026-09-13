const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        studyGroup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyGroup",
            default: null,
            index: true,
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

        notes: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Online",
        },

        meetingLink: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["Scheduled", "Completed", "Cancelled"],
            default: "Scheduled",
        },
    },
    { timestamps: true }
);

sessionSchema.index({ teacher: 1, date: 1, time: 1 });
sessionSchema.index({ learner: 1, date: 1, time: 1 });
sessionSchema.index({ studyGroup: 1, date: 1, time: 1 });

module.exports = mongoose.model("Session", sessionSchema);