requireAuth();
const cards = document.getElementById("analyticsCards");
const monthly = document.getElementById("monthly");
const snapshot = document.getElementById("snapshot");

async function loadAnalytics() {
    try {
        const { analytics } = await api("/analytics/me");
        const stats = [
            ["Sessions completed", analytics.sessionsCompleted, "↗"],
            ["Sessions scheduled", analytics.sessionsScheduled, "◷"],
            ["Requests accepted", analytics.requestsAccepted, "✓"],
            ["Skills", analytics.skillCount, "✦"],
            ["Credits", analytics.credits, "◆"],
            ["Trust score", `${analytics.trustScore}/100`, "🛡"],
        ];
        cards.innerHTML = stats.map(([label, value, icon]) => `<div class="col-6 col-lg-4 col-xl-2"><div class="stat-card"><div class="stat-icon">${icon}</div><div class="stat-label mt-2">${label}</div><div class="stat-value">${escapeHtml(value)}</div></div></div>`).join("");
        const max = Math.max(1, ...analytics.monthly.map((item) => item.sessions));
        monthly.innerHTML = analytics.monthly.map((item) => `<div class="analytics-bar-item"><div class="analytics-bar-track"><div class="analytics-bar-fill" style="height:${Math.max(6, (item.sessions / max) * 100)}%"></div></div><strong>${item.sessions}</strong><span>${escapeHtml(item.label)}</span></div>`).join("");
        snapshot.innerHTML = [
            ["Average rating", analytics.rating ? `${analytics.rating}/5` : "New"],
            ["Reviews given", analytics.reviewsGiven],
            ["Goals completed", analytics.goalsCompleted],
            ["Learning progress", `${analytics.goalsCompleted} completed goals`],
        ].map(([a,b]) => `<div class="col-md-3"><div class="border rounded-4 p-3"><div class="small text-secondary">${a}</div><strong class="fs-4">${escapeHtml(b)}</strong></div></div>`).join("");
    } catch (error) { cards.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`; }
}
loadAnalytics();
