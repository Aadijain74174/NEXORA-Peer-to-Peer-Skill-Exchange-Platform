requireAuth();

const profileForm = document.getElementById("profileForm");
const messageBox = document.getElementById("msg");
const goalsContainer = document.getElementById("goals");

function skillArray(value) {
    return [...new Set(String(value || "").split(",").map((item) => item.trim()).filter(Boolean))];
}

const availabilityDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function renderAvailability(slots = []) {
    const map = new Map(slots.map((slot) => [slot.day, slot]));
    document.getElementById("availabilitySlots").innerHTML = availabilityDays.map((day) => {
        const slot = map.get(day) || {};
        return `<div class="col-md-6 col-xl-4"><div class="availability-slot"><label class="form-check-label"><input class="form-check-input me-2" type="checkbox" data-day="${day}" ${slot.start ? "checked" : ""}>${day}</label><div class="d-flex gap-2 mt-2"><input class="form-control form-control-sm" type="time" data-start="${day}" value="${slot.start || "18:00"}"><input class="form-control form-control-sm" type="time" data-end="${day}" value="${slot.end || "20:00"}"></div></div></div>`;
    }).join("");
}

function getAvailabilitySlots() {
    return availabilityDays.map((day) => {
        const check = document.querySelector(`input[data-day="${day}"]`);
        const start = document.querySelector(`input[data-start="${day}"]`)?.value;
        const end = document.querySelector(`input[data-end="${day}"]`)?.value;
        return check?.checked && start && end && start < end ? { day, start, end } : null;
    }).filter(Boolean);
}

async function loadProfile() {
    try {
        const data = await api("/auth/me");
        const user = data.user;
        localStorage.setItem("user", JSON.stringify(user));

        ["name", "email", "education", "location", "experienceLevel", "availability", "bio"].forEach((key) => {
            document.getElementById(key).value = user[key] || "";
        });
        document.getElementById("teach").value = (user.teachSkills || []).join(", ");
        document.getElementById("learn").value = (user.learnSkills || []).join(", ");
        document.getElementById("credits").textContent = user.skillCredits ?? 0;
        document.getElementById("trust").textContent = `${user.trustScore ?? 50}/100`;
        document.getElementById("rating").textContent = user.reviewCount ? `${user.rating}/5` : "New";
        renderAvailability(user.availabilitySlots || []);
        await Promise.all([loadGoals(), loadAchievements()]);
    } catch (error) {
        toast(error.message, "danger");
    }
}

profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageBox.innerHTML = "";

    try {
        const currentUser = getUser();
        const data = await api(`/users/${currentUser._id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                education: document.getElementById("education").value.trim(),
                location: document.getElementById("location").value.trim(),
                experienceLevel: document.getElementById("experienceLevel").value,
                availability: document.getElementById("availability").value,
                bio: document.getElementById("bio").value.trim(),
                teachSkills: skillArray(document.getElementById("teach").value),
                learnSkills: skillArray(document.getElementById("learn").value),
                availabilitySlots: getAvailabilitySlots(),
            }),
        });

        localStorage.setItem("user", JSON.stringify(data.user));
        messageBox.innerHTML = `<div class="alert alert-success">Profile and skills saved successfully.</div>`;
        toast("Profile updated!");
    } catch (error) {
        messageBox.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
});

async function loadGoals() {
    const data = await api("/users/me/goals");
    goalsContainer.innerHTML = data.goals.map((goal) => `
        <article class="border rounded-4 p-3 mb-2">
            <div class="d-flex justify-content-between gap-2"><strong>${escapeHtml(goal.title)}</strong><span class="badge ${goal.status === "Completed" ? "text-bg-success" : "badge-soft"}">${escapeHtml(goal.status)}</span></div>
            <div class="small text-secondary mt-1">${escapeHtml(goal.skill || "Learning goal")} ${goal.targetDate ? `• Target ${escapeHtml(goal.targetDate)}` : ""}</div>
            <div class="progress mt-3"><div class="progress-bar" style="width:${goal.progress}%"></div></div>
            <div class="d-flex align-items-center gap-2 mt-2"><small>${goal.progress}%</small><input class="form-range flex-grow-1" type="range" min="0" max="100" value="${goal.progress}" data-progress="${goal._id}"><button class="btn btn-sm btn-outline-danger" data-delete-goal="${goal._id}">Delete</button></div>
        </article>`).join("") || `<div class="empty-state">No learning goals yet. Add your first target above.</div>`;
}

document.getElementById("goalForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        await api("/users/me/goals", {
            method: "POST",
            body: JSON.stringify({
                title: document.getElementById("goalTitle").value,
                skill: document.getElementById("goalSkill").value,
                targetDate: document.getElementById("goalDate").value,
            }),
        });
        event.target.reset();
        await loadGoals();
        toast("Learning goal added!");
    } catch (error) {
        toast(error.message, "danger");
    }
});

goalsContainer.addEventListener("change", async (event) => {
    const slider = event.target.closest("input[data-progress]");
    if (!slider) return;
    try {
        await api(`/users/me/goals/${slider.dataset.progress}`, {
            method: "PUT",
            body: JSON.stringify({ progress: Number(slider.value) }),
        });
        await loadGoals();
    } catch (error) {
        toast(error.message, "danger");
    }
});

goalsContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-delete-goal]");
    if (!button || !confirm("Delete this learning goal?")) return;
    try {
        await api(`/users/me/goals/${button.dataset.deleteGoal}`, { method: "DELETE" });
        await loadGoals();
        toast("Goal deleted.");
    } catch (error) {
        toast(error.message, "danger");
    }
});

loadProfile();

async function loadAchievements() {
    const container = document.getElementById("achievements");
    try {
        const { achievements } = await api("/users/me/achievements");
        container.innerHTML = achievements.map((item) => `<div class="col-md-6 col-xl-4"><div class="achievement-card ${item.unlocked ? "unlocked" : "locked"}"><div class="achievement-icon">${item.icon}</div><div><strong>${escapeHtml(item.title)}</strong><p class="small text-secondary mb-0 mt-1">${escapeHtml(item.description)}</p><span class="badge mt-2 ${item.unlocked ? "text-bg-success" : "badge-soft"}">${item.unlocked ? "Unlocked" : "Locked"}</span></div></div></div>`).join("");
    } catch (error) { container.innerHTML = `<div class="col-12"><div class="alert alert-warning">${escapeHtml(error.message)}</div></div>`; }
}
