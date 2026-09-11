const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        skillOffered: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        skillWanted: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        message: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

requestSchema.index({ receiver: 1, status: 1, createdAt: -1 });
requestSchema.index({ sender: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("ExchangeRequest", requestSchema);
