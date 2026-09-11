requireAuth();

const roomContent = document.getElementById("roomContent");
const roomTitle = document.getElementById("roomTitle");
const roomStatus = document.getElementById("roomStatus");
const sessionId = new URLSearchParams(window.location.search).get("id");

function formatDate(value) {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { dateStyle: "medium" });
}

async function loadRoom() {
    if (!sessionId) {
        roomStatus.textContent = "No session selected.";
        roomContent.innerHTML = `<div class="col-12"><div class="alert alert-warning">Open a session using its Join Session button.</div></div>`;
        return;
    }

    try {
        const data = await api(`/sessions/${sessionId}`);
        const session = data.session;
        const me = getUser();
        const partner = String(session.teacher._id) === String(me._id) ? session.learner : session.teacher;

        roomTitle.textContent = session.skill;
        roomStatus.textContent = `${session.status} • ${formatDate(session.date)} at ${session.time}`;

        roomContent.innerHTML = `
            <div class="col-lg-8">
                <section class="card-soft h-100">
                    <div class="d-flex align-items-center justify-content-between gap-3"><div><h4 class="mb-1">${escapeHtml(session.skill)} session</h4><p class="text-secondary mb-0">A dedicated Nexora room for your peer-learning exchange.</p></div><span class="badge badge-soft">${escapeHtml(session.status)}</span></div>
                    <div class="row g-3 mt-3"><div class="col-sm-6"><div class="border rounded-4 p-3"><div class="small text-secondary">You</div><strong>${escapeHtml(me.name)}</strong></div></div><div class="col-sm-6"><div class="border rounded-4 p-3"><div class="small text-secondary">Partner</div><strong>${escapeHtml(partner.name)}</strong></div></div></div>
                    <div class="border rounded-4 p-4 mt-3 text-center bg-light"><div class="display-6">🤝</div><h5 class="mt-2">Session workspace</h5><p class="text-secondary mb-3">Use Chat to coordinate notes and your meeting link for video/audio if one was supplied.</p><a class="btn btn-primary" href="/pages/chat.html?userId=${partner._id}">Open partner chat</a>${session.meetingLink ? `<a class="btn btn-outline-primary ms-2" target="_blank" rel="noopener noreferrer" href="${escapeHtml(session.meetingLink)}">Open meeting link</a>` : ""}</div>
                </section>
            </div>
            <div class="col-lg-4">
                <section class="card-soft"><h4>Session details</h4><dl class="mt-3 mb-0"><dt class="text-secondary small">Date</dt><dd>${escapeHtml(formatDate(session.date))}</dd><dt class="text-secondary small">Time</dt><dd>${escapeHtml(session.time)} • ${session.duration || 60} minutes</dd><dt class="text-secondary small">Mode</dt><dd>${escapeHtml(session.mode)}</dd><dt class="text-secondary small">Notes</dt><dd>${escapeHtml(session.notes || "No notes added.")}</dd></dl></section>
                <section class="card-soft mt-3"><h5>Next step</h5><p class="text-secondary small">After the exchange, mark the session completed. Both participants can then leave a rating and review.</p><a class="btn btn-outline-secondary btn-sm" href="/pages/sessions.html">Back to sessions</a></section>
            </div>`;
    } catch (error) {
        roomStatus.textContent = "Unable to open session.";
        roomContent.innerHTML = `<div class="col-12"><div class="alert alert-danger">${escapeHtml(error.message)}</div></div>`;
    }
}

loadRoom();
