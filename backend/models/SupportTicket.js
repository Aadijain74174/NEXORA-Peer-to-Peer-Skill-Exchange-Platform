const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        name: { type: String, default: "", trim: true, maxlength: 100 },
        email: { type: String, default: "", trim: true, lowercase: true },
        subject: { type: String, required: true, trim: true, maxlength: 150 },
        summary: { type: String, default: "", trim: true, maxlength: 2000 },
        transcript: [
            {
                role: { type: String, enum: ["user", "assistant"] },
                content: { type: String, maxlength: 2000 },
                _id: false,
            },
        ],
        status: {
            type: String,
            enum: ["Open", "In Progress", "Resolved"],
            default: "Open",
        },
        adminNote: { type: String, default: "", trim: true, maxlength: 1000 },
    },
    { timestamps: true }
);

supportTicketSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);