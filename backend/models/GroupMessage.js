const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyGroup",
            required: true,
            index: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

groupMessageSchema.index({
    group: 1,
    createdAt: 1,
});

module.exports = mongoose.model(
    "GroupMessage",
    groupMessageSchema
);