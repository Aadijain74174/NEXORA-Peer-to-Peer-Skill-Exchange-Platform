const mongoose = require("mongoose");

const creditTransactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ["earned", "spent", "adjustment"], required: true },
        reason: { type: String, required: true, trim: true, maxlength: 200 },
        relatedSession: { type: mongoose.Schema.Types.ObjectId, ref: "Session", default: null },
    },
    { timestamps: true }
);

creditTransactionSchema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model("CreditTransaction", creditTransactionSchema);
