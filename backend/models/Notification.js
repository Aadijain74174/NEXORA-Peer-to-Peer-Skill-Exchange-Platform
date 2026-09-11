const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    type: {
        type: String,
        enum: ["request", "session", "message", "review", "system"],
        default: "system",
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
