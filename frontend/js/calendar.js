requireAuth();

let sessions = [];
let cursor = new Date();
cursor.setDate(1);

const title = document.getElementById("title");
const grid = document.getElementById("grid");
const upcoming = document.getElementById("upcoming");

function localDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function changeMonth(delta) {
    cursor.setMonth(cursor.getMonth() + delta);
    renderCalendar();
}

function renderCalendar() {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayKey = localDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    title.textContent = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
    grid.innerHTML = "";

    for (let index = 0; index < firstDay; index += 1) {
        grid.insertAdjacentHTML("beforeend", `<div><div class="calendar-cell opacity-50"></div></div>`);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const key = localDateKey(year, month, day);
        const daySessions = sessions.filter((session) => session.date === key);
        const events = daySessions.map((session) => `
            <button class="calendar-event" data-session-id="${session._id}" title="${escapeHtml(session.skill)} at ${escapeHtml(session.time)}">
                ${escapeHtml(session.time)} • ${escapeHtml(session.skill)}
            </button>`).join("");

        grid.insertAdjacentHTML("beforeend", `
            <div><div class="calendar-cell ${key === todayKey ? "today" : ""}"><strong>${day}</strong>${events}</div></div>`);
    }
}

function renderUpcoming() {
    const upcomingSessions = sessions
        .filter((session) => session.status === "Scheduled")
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .slice(0, 10);

    upcoming.innerHTML = upcomingSessions.map((session) => `
        <div class="border rounded-4 p-3 mb-2">
            <div class="d-flex justify-content-between gap-2"><strong>${escapeHtml(session.skill)}</strong><span class="badge badge-soft">${escapeHtml(session.status)}</span></div>
            <div class="small text-secondary mt-1">${escapeHtml(session.date)} • ${escapeHtml(session.time)} • ${escapeHtml(session.teacher.name)} ↔ ${escapeHtml(session.learner.name)}</div>
            <a class="btn btn-sm btn-primary mt-2" href="/pages/session-room.html?id=${session._id}">Join Session</a>
        </div>`).join("") || `<div class="empty-state">No upcoming sessions. Schedule one from Sessions.</div>`;
}

grid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-session-id]");
    if (!button) return;
    window.location.href = `/pages/session-room.html?id=${button.dataset.sessionId}`;
});

document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));
document.getElementById("todayBtn").addEventListener("click", () => { cursor = new Date(); cursor.setDate(1); renderCalendar(); });

(async function loadCalendar() {
    try {
        const data = await api("/sessions");
        sessions = data.sessions;
        renderCalendar();
        renderUpcoming();
    } catch (error) {
        toast(error.message, "danger");
    }
})();
