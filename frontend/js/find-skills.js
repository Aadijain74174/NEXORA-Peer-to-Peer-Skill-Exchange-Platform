requireAuth();

const skillInput = document.getElementById("skill");
const experienceInput = document.getElementById("experience");
const availabilityInput = document.getElementById("availability");
const ratingInput = document.getElementById("rating");
const results = document.getElementById("results");

async function loadUsers() {
    results.innerHTML = `<div class="loading-state">Searching partners...</div>`;

    try {
        const params = new URLSearchParams({
            skill: skillInput.value.trim(),
            experienceLevel: experienceInput.value,
            availability: availabilityInput.value,
            rating: ratingInput.value,
        });
        const data = await api(`/users?${params}`);

        if (!data.users.length) {
            results.innerHTML = `<div class="col-12"><div class="empty-state">No partners found. Try another skill or remove a filter.</div></div>`;
            return;
        }

        results.innerHTML = data.users.map((user) => {
            const teach = (user.teachSkills || []).map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join("") || `<span class="text-secondary">No teaching skills added</span>`;
            const learn = (user.learnSkills || []).map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join("") || `<span class="text-secondary">No learning skills added</span>`;

            return `
                <div class="col-md-6 col-xl-4">
                    <article class="card-soft h-100">
                        <div class="d-flex gap-3 align-items-center">
                            <div class="avatar">${escapeHtml((user.name || "S").charAt(0).toUpperCase())}</div>
                            <div><h5 class="mb-1">${escapeHtml(user.name)}</h5><div class="small text-secondary">${escapeHtml(user.experienceLevel)} • ${escapeHtml(user.availability)}</div></div>
                        </div>
                        <p class="small text-secondary mt-3 mb-2">${escapeHtml(user.bio || "Open to a new skill exchange.")}</p>
                        <div><strong class="small">Teaches</strong><div>${teach}</div></div>
                        <div class="mt-2"><strong class="small">Wants to learn</strong><div>${learn}</div></div>
                        <div class="small mt-3">⭐ ${user.reviewCount ? `${user.rating}/5 (${user.reviewCount})` : "New"}</div>
                        <div class="d-flex gap-2 mt-3"><a class="btn btn-sm btn-outline-primary" href="/pages/view-profile.html?userId=${user._id}">View profile</a><button class="btn btn-sm btn-primary" data-user-id="${user._id}" data-user-name="${escapeHtml(user.name)}" data-teach="${escapeHtml((user.teachSkills || []).join(", "))}" data-learn="${escapeHtml((user.learnSkills || []).join(", "))}">Request exchange</button></div>
                    </article>
                </div>`;
        }).join("");
    } catch (error) {
        results.innerHTML = `<div class="col-12"><div class="alert alert-danger">${escapeHtml(error.message)}</div></div>`;
    }
}

results.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-user-id]");
    if (!button) return;

    const offered = prompt(`What will you teach ${button.dataset.userName}?`, button.dataset.teach.split(", ")[0] || "");
    const wanted = prompt(`What do you want to learn from ${button.dataset.userName}?`, button.dataset.learn.split(", ")[0] || "");
    if (!offered?.trim() || !wanted?.trim()) return;

    try {
        await api("/requests", {
            method: "POST",
            body: JSON.stringify({
                receiver: button.dataset.userId,
                skillOffered: offered.trim(),
                skillWanted: wanted.trim(),
                message: "I would like to exchange skills with you through Nexora.",
            }),
        });
        toast("Exchange request sent!");
    } catch (error) {
        toast(error.message, "danger");
    }
});

document.getElementById("searchBtn").addEventListener("click", loadUsers);
[skillInput, experienceInput, availabilityInput, ratingInput].forEach((input) => input.addEventListener("change", loadUsers));
skillInput.addEventListener("keydown", (event) => { if (event.key === "Enter") loadUsers(); });

loadUsers();
