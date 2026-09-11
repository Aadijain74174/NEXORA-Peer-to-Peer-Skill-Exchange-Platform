requireAuth();

const profileView = document.getElementById("profileView");
const userId = new URLSearchParams(window.location.search).get("userId");

async function loadProfile() {
    if (!userId) {
        profileView.innerHTML = `<div class="alert alert-warning">No partner selected.</div>`;
        return;
    }

    try {
        const data = await api(`/users/${userId}`);
        const user = data.user;
        const reviews = await api(`/reviews/${userId}`);
        const tags = (skills) => (skills || []).map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join("") || `<span class="text-secondary">None added</span>`;

        profileView.innerHTML = `
            <div class="row g-4">
                <div class="col-lg-8"><div class="d-flex gap-3 align-items-center"><div class="avatar" style="width:70px;height:70px;font-size:1.5rem">${escapeHtml((user.name || "S").charAt(0).toUpperCase())}</div><div><h2 class="mb-1">${escapeHtml(user.name)}</h2><div class="text-secondary">${escapeHtml(user.location || "Location not added")} • ${escapeHtml(user.experienceLevel)}</div></div></div><p class="mt-4">${escapeHtml(user.bio || "This partner has not added a bio yet.")}</p><div class="mt-4"><strong>Can teach</strong><div class="mt-2">${tags(user.teachSkills)}</div></div><div class="mt-4"><strong>Wants to learn</strong><div class="mt-2">${tags(user.learnSkills)}</div></div></div>
                <div class="col-lg-4"><div class="border rounded-4 p-3"><div class="d-flex justify-content-between"><span>Rating</span><strong>${user.reviewCount ? `${user.rating}/5` : "New"}</strong></div><div class="d-flex justify-content-between mt-3"><span>Reviews</span><strong>${user.reviewCount || 0}</strong></div><div class="d-flex justify-content-between mt-3"><span>Trust</span><strong>${user.trustScore ?? 50}/100</strong></div><div class="d-flex justify-content-between mt-3"><span>Availability</span><strong>${escapeHtml(user.availability)}</strong></div></div><div class="d-grid gap-2 mt-3"><a class="btn btn-primary" href="/pages/chat.html?userId=${user._id}">Chat</a><a class="btn btn-outline-primary" href="/pages/sessions.html">Schedule session</a><button class="btn btn-outline-danger" id="reportPartner">Report / Block</button></div></div>
            </div>
            <hr class="my-4"><h4>Availability</h4><div class="d-flex flex-wrap gap-2 mt-3">${(user.availabilitySlots || []).map((slot) => `<span class="skill-tag">${escapeHtml(slot.day)} · ${escapeHtml(slot.start)}–${escapeHtml(slot.end)}</span>`).join("") || `<span class="text-secondary">${escapeHtml(user.availability || "Flexible")}</span>`}</div><hr class="my-4"><h4>Recent reviews</h4><div class="mt-3">${reviews.reviews.slice(0, 5).map((review) => `<div class="border rounded-4 p-3 mb-2"><div class="text-warning">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div><div class="mt-1">${escapeHtml(review.comment || "No comment.")}</div><div class="small text-secondary mt-1">${escapeHtml(review.reviewer?.name || "User")}</div></div>`).join("") || `<div class="empty-state">No reviews yet.</div>`}</div>`;
        document.getElementById("reportPartner")?.addEventListener("click", async () => {
            const reason = prompt("Reason: Spam, Fake profile, Inappropriate behaviour, Misleading skill, or Other", "Other");
            if (!reason) return;
            const normalized = ["Spam", "Fake profile", "Inappropriate behaviour", "Misleading skill", "Other"].find((item) => item.toLowerCase() === reason.trim().toLowerCase()) || "Other";
            const details = prompt("Optional details:", "") || "";
            try { await api("/reports", { method: "POST", body: JSON.stringify({ reportedUser: user._id, reason: normalized, details }) }); toast("Report submitted. Our team will review it."); } catch (error) { toast(error.message, "danger"); }
        });
    } catch (error) {
        profileView.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
}

loadProfile();
