requireAuth();

const list = document.getElementById("list");
const readAllButton = document.getElementById("readAll");

const icons = {
    request: "🤝",
    session: "📅",
    message: "💬",
    review: "⭐",
    system: "ℹ️",
};

async function loadNotifications() {
    try {
        const data = await api("/notifications");
        list.innerHTML = data.notifications.map((notification) => `
            <article class="card-soft mb-3 ${notification.read ? "" : "border-primary"}">
                <div class="d-flex justify-content-between gap-3">
                    <div class="d-flex gap-3">
                        <div class="avatar">${icons[notification.type] || "ℹ️"}</div>
                        <div><div class="${notification.read ? "" : "fw-semibold"}">${escapeHtml(notification.message)}</div><div class="small text-secondary mt-1">${new Date(notification.createdAt).toLocaleString()}</div></div>
                    </div>
                    ${notification.read ? "" : `<button class="btn btn-sm btn-outline-secondary align-self-start" data-read="${notification._id}">Mark read</button>`}
                </div>
            </article>`).join("") || `<div class="empty-state"><h5>You're all caught up.</h5><p class="mb-0">New requests, messages and session updates will appear here.</p></div>`;
        refreshNotificationCount();
    } catch (error) {
        list.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
}

list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-read]");
    if (!button) return;
    try {
        await api(`/notifications/${button.dataset.read}/read`, { method: "PUT" });
        await loadNotifications();
    } catch (error) {
        toast(error.message, "danger");
    }
});

readAllButton.addEventListener("click", async () => {
    try {
        await api("/notifications/read-all", { method: "PUT" });
        await loadNotifications();
        toast("All notifications marked as read.");
    } catch (error) {
        toast(error.message, "danger");
    }
});

loadNotifications();
