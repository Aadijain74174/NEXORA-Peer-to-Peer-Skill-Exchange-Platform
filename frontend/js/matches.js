requireAuth();
const matchesContainer = document.getElementById("matches");

async function loadMatches() {
    try {
        const data = await api("/matches");
        if (!data.matches.length) {
            matchesContainer.innerHTML = `<div class="col-12"><div class="empty-state"><h5>No smart matches yet</h5><p class="mb-2">Add at least one teaching skill and one learning skill to your profile.</p><a class="btn btn-primary btn-sm" href="/pages/skills.html">Update my skills</a></div></div>`;
            return;
        }

        matchesContainer.innerHTML = data.matches.map((match) => {
            const user = match.user;
            const requestSkill = match.skillsICanTeachThem[0] || "My skill";
            const wantedSkill = match.skillsTheyCanTeachMe[0] || "Requested skill";

            return `
                <div class="col-md-6 col-xl-4">
                    <article class="card-soft h-100">
                        <div class="d-flex justify-content-between gap-3">
                            <div class="d-flex gap-3"><div class="avatar">${escapeHtml((user.name || "S").charAt(0).toUpperCase())}</div><div><h5 class="mb-1">${escapeHtml(user.name)}</h5><div class="small text-secondary">${escapeHtml(user.experienceLevel)} • ${escapeHtml(user.availability)}</div></div></div>
                            <span class="match-score">${match.score}%</span>
                        </div>
                        <hr>
                        <div class="small"><strong>They can teach you:</strong><br>${escapeHtml(match.skillsTheyCanTeachMe.join(", ") || "No direct match")}</div>
                        <div class="small mt-2"><strong>You can teach them:</strong><br>${escapeHtml(match.skillsICanTeachThem.join(", ") || "No direct match")}</div>
                        <div class="small text-secondary mt-3">⭐ ${user.reviewCount ? `${user.rating}/5` : "New"} • Trust ${user.trustScore ?? 50}/100</div>
                        <div class="match-reasons mt-3"><strong class="small">Why this match?</strong><ul class="small text-secondary mt-2 mb-0 ps-3">${(match.reasons || []).slice(0, 4).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul></div>
                        <div class="d-flex gap-2 mt-3"><button class="btn btn-sm btn-primary" data-request="${user._id}" data-offer="${escapeHtml(requestSkill)}" data-want="${escapeHtml(wantedSkill)}">Send request</button><a class="btn btn-sm btn-outline-primary" href="/pages/view-profile.html?userId=${user._id}">Profile</a><a class="btn btn-sm btn-outline-secondary" href="/pages/chat.html?userId=${user._id}">Chat</a></div>
                    </article>
                </div>`;
        }).join("");
    } catch (error) {
        matchesContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">${escapeHtml(error.message)}</div></div>`;
    }
}

matchesContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-request]");
    if (!button) return;

    try {
        await api("/requests", {
            method: "POST",
            body: JSON.stringify({
                receiver: button.dataset.request,
                skillOffered: button.dataset.offer,
                skillWanted: button.dataset.want,
                message: "Your profile was recommended as a strong Nexora skill match.",
            }),
        });
        toast("Request sent!");
    } catch (error) {
        toast(error.message, "danger");
    }
});

loadMatches();
