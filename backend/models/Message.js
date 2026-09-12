const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
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
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
