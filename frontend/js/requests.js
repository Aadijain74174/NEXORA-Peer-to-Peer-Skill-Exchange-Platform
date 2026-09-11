requireAuth();

const receivedEl = document.getElementById("received");
const sentEl = document.getElementById("sent");

function requestCard(request, direction) {
    const person = direction === "received" ? request.sender : request.receiver;
    const statusClass = {
        pending: "warning",
        accepted: "success",
        rejected: "secondary",
        cancelled: "secondary",
        completed: "primary",
    }[request.status] || "secondary";

    return `
        <article class="border rounded-4 p-3 mb-2">
            <div class="d-flex justify-content-between gap-2">
                <div><strong>${escapeHtml(person?.name || "User")}</strong><div class="small text-secondary">${escapeHtml(person?.email || "")}</div></div>
                <span class="badge text-bg-${statusClass}">${escapeHtml(request.status)}</span>
            </div>
            <div class="mt-3"><span class="skill-tag">Teach: ${escapeHtml(request.skillOffered)}</span><span class="skill-tag">Learn: ${escapeHtml(request.skillWanted)}</span></div>
            ${request.message ? `<p class="small text-secondary mt-2 mb-0">“${escapeHtml(request.message)}”</p>` : ""}
            ${direction === "received" && request.status === "pending" ? `<div class="d-flex gap-2 mt-3"><button class="btn btn-sm btn-success" data-action="accept" data-id="${request._id}">Accept</button><button class="btn btn-sm btn-outline-danger" data-action="reject" data-id="${request._id}">Reject</button></div>` : ""}
            ${direction === "sent" && request.status === "pending" ? `<button class="btn btn-sm btn-outline-secondary mt-3" data-action="cancel" data-id="${request._id}">Cancel request</button>` : ""}
            ${request.status === "accepted" ? `<a class="btn btn-sm btn-outline-primary mt-3" href="/pages/chat.html?userId=${person?._id}">Chat with partner</a>` : ""}
        </article>`;
}

async function loadRequests() {
    try {
        const [received, sent] = await Promise.all([api("/requests/received"), api("/requests/sent")]);
        receivedEl.innerHTML = received.requests.map((item) => requestCard(item, "received")).join("") || `<div class="empty-state">No received requests.</div>`;
        sentEl.innerHTML = sent.requests.map((item) => requestCard(item, "sent")).join("") || `<div class="empty-state">No sent requests.</div>`;
    } catch (error) {
        toast(error.message, "danger");
    }
}

document.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    try {
        await api(`/requests/${button.dataset.id}/${action}`, { method: "PUT" });
        toast(action === "accept" ? "Request accepted!" : action === "reject" ? "Request rejected." : "Request cancelled.");
        await loadRequests();
        refreshNotificationCount();
    } catch (error) {
        toast(error.message, "danger");
    }
});

loadRequests();
