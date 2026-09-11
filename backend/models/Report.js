const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, enum: ["Spam", "Fake profile", "Inappropriate behaviour", "Misleading skill", "Other"], required: true },
        details: { type: String, default: "", trim: true, maxlength: 1000 },
        status: { type: String, enum: ["Open", "Reviewed", "Resolved"], default: "Open" },
    },
    { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model("Report", reportSchema);
