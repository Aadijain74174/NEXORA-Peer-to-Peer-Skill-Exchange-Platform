requireAuth();

const form = document.getElementById("skillsForm");
const message = document.getElementById("msg");

function toSkills(value) {
    return [...new Set(String(value || "").split(",").map((item) => item.trim()).filter(Boolean))];
}

async function loadSkills() {
    const data = await api("/auth/me");
    document.getElementById("teachSkills").value = (data.user.teachSkills || []).join(", ");
    document.getElementById("learnSkills").value = (data.user.learnSkills || []).join(", ");
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const user = getUser();
        const data = await api(`/users/${user._id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: user.name,
                teachSkills: toSkills(document.getElementById("teachSkills").value),
                learnSkills: toSkills(document.getElementById("learnSkills").value),
            }),
        });
        localStorage.setItem("user", JSON.stringify(data.user));
        message.innerHTML = `<div class="alert alert-success">Skills saved. Matching and dashboard data will use the new lists.</div>`;
        toast("Skills updated!");
    } catch (error) {
        message.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
});

loadSkills().catch((error) => toast(error.message, "danger"));
