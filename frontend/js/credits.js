requireAuth();
async function loadCredits() {
    try {
        const data = await api("/credits");
        document.getElementById("balance").textContent = data.balance;
        document.getElementById("transactions").innerHTML = data.transactions.map((item) => `<div class="credit-row"><div><strong>${escapeHtml(item.reason)}</strong><div class="small text-secondary">${new Date(item.createdAt).toLocaleString()}</div></div><strong class="${item.amount >= 0 ? "text-success" : "text-danger"}">${item.amount >= 0 ? "+" : ""}${item.amount}</strong></div>`).join("") || `<div class="empty-state">No credit activity yet. Complete your first exchange to earn credits.</div>`;
    } catch (error) { toast(error.message, "danger"); }
}
loadCredits();
