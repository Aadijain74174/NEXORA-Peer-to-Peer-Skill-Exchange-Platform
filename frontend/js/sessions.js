requireAuth();

const me = getUser();
const sessionForm = document.getElementById("sessionForm");
const partnerInput = document.getElementById("partner");
const partnerList = document.getElementById("partnerList");
const list = document.getElementById("list");
const dateInput = document.getElementById("date");

function todayString() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

dateInput.min = todayString();

async function loadPartners() {
    try {
        const data = await api("/users");
        partnerList.innerHTML = data.users.map((user) => `<option value="${escapeHtml(user.name)}">${escapeHtml(user.email)}</option>`).join("");
    } catch {
        // Partner suggestions are optional; the server still accepts an exact name/email.
    }
}

function sessionCard(session) {
    const isMineAsTeacher = String(session.teacher?._id) === String(me._id);
    const partner = isMineAsTeacher ? session.learner : session.teacher;
    const isScheduled = session.status === "Scheduled";

    return `
        <article class="border rounded-4 p-3 mb-2">
            <div class="d-flex justify-content-between gap-3 flex-wrap">
                <div><h5 class="mb-1">${escapeHtml(session.skill)}</h5><div class="text-secondary small">${isMineAsTeacher ? "Teaching" : "Learning"} with ${escapeHtml(partner?.name || "Partner")}</div></div>
                <span class="badge ${session.status === "Completed" ? "text-bg-success" : session.status === "Cancelled" ? "text-bg-secondary" : "badge-soft"}">${escapeHtml(session.status)}</span>
            </div>
            <div class="small text-secondary mt-3">${escapeHtml(session.date)} • ${escapeHtml(session.time)} • ${session.duration || 60} minutes • ${escapeHtml(session.mode)}</div>
            ${session.notes ? `<div class="small mt-2">Notes: ${escapeHtml(session.notes)}</div>` : ""}
            <div class="d-flex gap-2 flex-wrap mt-3">
                ${isScheduled ? `<a class="btn btn-sm btn-primary" href="/pages/session-room.html?id=${session._id}">Join Session</a><button class="btn btn-sm btn-outline-success" data-complete="${session._id}">Mark completed</button><button class="btn btn-sm btn-outline-danger" data-cancel="${session._id}">Cancel</button>` : ""}
                ${session.status === "Completed" ? `<a class="btn btn-sm btn-outline-warning" href="/pages/reviews.html?sessionId=${session._id}&userId=${partner?._id}">⭐ Rate partner</a>` : ""}
                <a class="btn btn-sm btn-outline-secondary" href="/pages/chat.html?userId=${partner?._id}">Chat</a>
                ${session.meetingLink ? `<a class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer" href="${escapeHtml(session.meetingLink)}">Open meeting link</a>` : ""}
            </div>
        </article>`;
}

async function loadSessions() {
    list.innerHTML = `<div class="loading-state">Loading sessions...</div>`;
    try {
        const data = await api("/sessions");
        list.innerHTML = data.sessions.map(sessionCard).join("") || `<div class="empty-state">No sessions yet. Schedule your first skill exchange.</div>`;
    } catch (error) {
        list.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
}

sessionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const partner = partnerInput.value.trim();
    const skill = document.getElementById("skill").value.trim();
    const date = dateInput.value;
    const time = document.getElementById("time").value;
    const duration = Number(document.getElementById("duration").value);
    const mode = document.getElementById("mode").value;
    const meetingLink = document.getElementById("meetingLink").value.trim();
    const notes = document.getElementById("notes").value.trim();

    if (!partner || !skill || !date || !time) {
        toast("Please fill the required fields.", "warning");
        return;
    }

    try {
        await api("/sessions", {
            method: "POST",
            body: JSON.stringify({
                teacher: me._id,
                partner,
                skill,
                date,
                time,
                duration,
                mode,
                meetingLink,
                notes,
            }),
        });
        toast("Session scheduled successfully!");
        sessionForm.reset();
        dateInput.min = todayString();
        await loadSessions();
    } catch (error) {
        toast(error.message, "danger");
    }
});

list.addEventListener("click", async (event) => {
    const complete = event.target.closest("button[data-complete]");
    const cancel = event.target.closest("button[data-cancel]");

    if (!complete && !cancel) return;
    const id = complete?.dataset.complete || cancel?.dataset.cancel;
    const action = complete ? "complete" : "cancel";

    if (action === "cancel" && !confirm("Cancel this session?")) return;

    try {
        await api(`/sessions/${id}/${action}`, { method: "PUT" });
        toast(action === "complete" ? "Session completed. You can now leave a review." : "Session cancelled.");
        await loadSessions();
        refreshNotificationCount();
    } catch (error) {
        toast(error.message, "danger");
    }
});

loadPartners();
loadSessions();
