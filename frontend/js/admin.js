requireAuth();
const statsEl = document.getElementById("adminStats");
const reportsEl = document.getElementById("reports");
async function loadAdmin() {
    try {
        const data = await api("/admin/overview");
        statsEl.innerHTML = Object.entries(data.stats).map(([key, value]) => `<div class="col-6 col-md-4 col-xl-3"><div class="stat-card"><div class="stat-label">${key.replace(/([A-Z])/g, " $1")}</div><div class="stat-value">${escapeHtml(value)}</div></div></div>`).join("");
        document.getElementById("topSkills").innerHTML = data.topSkills.map((skill) => `<span class="skill-tag">${escapeHtml(skill._id)} <b>${skill.count}</b></span>`).join("") || `<span class="text-secondary">No skill activity yet.</span>`;
        const reportData = await api("/reports/admin");
        reportsEl.innerHTML = reportData.reports.map((report) => `<article class="border rounded-4 p-3 mb-2"><div class="d-flex justify-content-between gap-2"><strong>${escapeHtml(report.reason)}</strong><span class="badge badge-soft">${escapeHtml(report.status)}</span></div><div class="small mt-2">Reported user: ${escapeHtml(report.reportedUser?.name || "Unknown")} • By ${escapeHtml(report.reporter?.name || "Unknown")}</div><div class="small text-secondary mt-1">${escapeHtml(report.details || "No details")}</div><div class="d-flex gap-2 mt-3"><button class="btn btn-sm btn-outline-primary" data-report="${report._id}" data-status="Reviewed">Mark reviewed</button><button class="btn btn-sm btn-outline-success" data-report="${report._id}" data-status="Resolved">Resolve</button>${report.reportedUser?._id ? `<button class="btn btn-sm btn-outline-danger" data-block="${report.reportedUser._id}" data-blocked="${!report.reportedUser.isBlocked}">${report.reportedUser.isBlocked ? "Unblock" : "Block user"}</button>` : ""}</div></article>`).join("") || `<div class="empty-state">No community reports.</div>`;
    } catch (error) { statsEl.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`; }
}
reportsEl.addEventListener("click", async (event) => {
    const report = event.target.closest("button[data-report]");
    const block = event.target.closest("button[data-block]");
    try {
        if (report) { await api(`/reports/admin/${report.dataset.report}`, { method: "PUT", body: JSON.stringify({ status: report.dataset.status }) }); toast("Report updated."); await loadAdmin(); }
        if (block) { await api(`/reports/admin/user/${block.dataset.block}`, { method: "PUT", body: JSON.stringify({ blocked: block.dataset.blocked === "true" }) }); toast("Account status updated."); await loadAdmin(); }
    } catch (error) { toast(error.message, "danger"); }
});
loadAdmin();
