const mongoose = require("mongoose");

const learningGoalSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 120 },
    skill: { type: String, default: "", trim: true, maxlength: 80 },
    targetDate: { type: String, default: "" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ["Active", "Completed"], default: "Active" },
});

const availabilitySlotSchema = new mongoose.Schema({
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], required: true },
    start: { type: String, match: /^\d{2}:\d{2}$/ },
    end: { type: String, match: /^\d{2}:\d{2}$/ },
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    bio: { type: String, default: "", maxlength: 1000 },
    profileImage: { type: String, default: "" },
    location: { type: String, default: "", maxlength: 120 },
    education: { type: String, default: "", maxlength: 160 },
    experienceLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    availability: { type: String, default: "Evening" },
    availabilitySlots: { type: [availabilitySlotSchema], default: [] },
    teachSkills: [{ type: String, trim: true }],
    learnSkills: [{ type: String, trim: true }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    skillCredits: { type: Number, min: 0, default: 3 },
    trustScore: { type: Number, min: 0, max: 100, default: 50 },
    learningGoals: { type: [learningGoalSchema], default: [] },
}, { timestamps: true });

userSchema.index({ name: "text", teachSkills: "text", learnSkills: "text" });
userSchema.index({ role: 1, isBlocked: 1 });

module.exports = mongoose.model("User", userSchema);
