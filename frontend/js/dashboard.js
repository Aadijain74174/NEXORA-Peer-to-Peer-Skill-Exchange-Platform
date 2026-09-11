requireAuth();

const nameEl = document.getElementById("name");
const matchList = document.getElementById("matchList");
const sessionList = document.getElementById("sessionList");
const goalList = document.getElementById("goalList");
const activityList = document.getElementById("activityList");

function renderMatches(matches) {
    if (!matches.length) {
        matchList.innerHTML = `<div class="col-12"><div class="empty-state">No matches yet. Add complementary skills to improve recommendations.</div></div>`;
        return;
    }

    matchList.innerHTML = matches.slice(0, 4).map((match) => {
        const user = match.user;
        const initial = escapeHtml((user.name || "S").charAt(0).toUpperCase());
        const teach = match.skillsTheyCanTeachMe.join(", ") || "No direct learning match";
        const learn = match.skillsICanTeachThem.join(", ") || "No direct teaching match";

        return `
            <div class="col-md-6">
                <div class="card-soft h-100">
                    <div class="d-flex gap-3 align-items-center">
                        <div class="avatar">${initial}</div>
                        <div class="min-w-0">
                            <h5 class="mb-1">${escapeHtml(user.name)}</h5>
                            <div class="text-secondary small">${escapeHtml(user.experienceLevel)} • ${escapeHtml(user.availability)}</div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="match-score">${match.score}%</span>
                        <span class="small text-secondary">Trust ${user.trustScore ?? 50}/100</span>
                    </div>
                    <div class="small mt-3"><strong>They teach you:</strong> ${escapeHtml(teach)}</div>
                    <div class="small mt-2"><strong>You teach them:</strong> ${escapeHtml(learn)}</div>
                    <div class="d-flex gap-2 mt-3">
                        <a class="btn btn-sm btn-primary" href="/pages/view-profile.html?userId=${user._id}">View profile</a>
                        <a class="btn btn-sm btn-outline-primary" href="/pages/chat.html?userId=${user._id}">Chat</a>
                    </div>
                </div>
            </div>`;
    }).join("");
}

function renderSessions(sessions) {
    const upcoming = sessions
        .filter((session) => session.status === "Scheduled")
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .slice(0, 4);

    if (!upcoming.length) {
        sessionList.innerHTML = `<div class="empty-state">No upcoming sessions. Schedule your first skill exchange.</div>`;
        return;
    }

    const me = getUser();
    sessionList.innerHTML = upcoming.map((session) => {
        const partner = String(session.teacher?._id) === String(me._id) ? session.learner : session.teacher;
        return `
            <div class="border rounded-4 p-3 mb-2">
                <div class="d-flex justify-content-between gap-2 flex-wrap">
                    <div><strong>${escapeHtml(session.skill)}</strong><div class="small text-secondary">With ${escapeHtml(partner?.name || "Partner")}</div></div>
                    <span class="badge badge-soft align-self-start">${escapeHtml(session.status)}</span>
                </div>
                <div class="small text-secondary mt-2">${escapeHtml(session.date)} • ${escapeHtml(session.time)} • ${session.duration || 60} min</div>
                <a class="btn btn-sm btn-primary mt-2" href="/pages/session-room.html?id=${session._id}">Join Session</a>
            </div>`;
    }).join("");
}

function renderGoals(goals) {
    const active = goals.filter((goal) => goal.status === "Active");
    document.getElementById("goalCount").textContent = active.length;

    goalList.innerHTML = goals.slice(0, 3).map((goal) => `
        <div class="border rounded-4 p-3 mb-2">
            <div class="d-flex justify-content-between gap-2"><strong>${escapeHtml(goal.title)}</strong><span>${goal.progress}%</span></div>
            <div class="progress mt-2"><div class="progress-bar" style="width:${goal.progress}%"></div></div>
            <div class="small text-secondary mt-2">${escapeHtml(goal.skill || "Learning goal")} ${goal.targetDate ? `• Target ${escapeHtml(goal.targetDate)}` : ""}</div>
        </div>`).join("") || `<div class="empty-state">No learning goals yet. Add one from your Profile.</div>`;
}

function renderActivity(notifications) {
    activityList.innerHTML = notifications.slice(0, 5).map((item) => `
        <div class="border-bottom py-2">
            <div class="small ${item.read ? "text-secondary" : "fw-semibold"}">${escapeHtml(item.message)}</div>
            <div class="text-secondary" style="font-size:.72rem">${new Date(item.createdAt).toLocaleString()}</div>
        </div>`).join("") || `<div class="empty-state">No recent activity.</div>`;
}

async function loadDashboard() {
    try {
        const [meResponse, matchResponse, receivedResponse, sentResponse, goalsResponse, sessionsResponse, notificationResponse] = await Promise.all([
            api("/auth/me"),
            api("/matches"),
            api("/requests/received"),
            api("/requests/sent"),
            api("/users/me/goals"),
            api("/sessions"),
            api("/notifications"),
        ]);

        const user = meResponse.user;
        localStorage.setItem("user", JSON.stringify(user));
        nameEl.textContent = user.name || "Student";
        document.getElementById("skills").textContent = new Set([...(user.teachSkills || []), ...(user.learnSkills || [])]).size;
        document.getElementById("credits").textContent = user.skillCredits ?? 0;
        document.getElementById("trust").textContent = `${user.trustScore ?? 50}/100`;
        document.getElementById("rating").textContent = user.reviewCount ? `${user.rating}/5` : "New";
        document.getElementById("matches").textContent = matchResponse.matches.length;
        document.getElementById("requests").textContent = receivedResponse.requests.filter((item) => item.status === "pending").length + sentResponse.requests.filter((item) => item.status === "pending").length;

        renderMatches(matchResponse.matches);
        renderSessions(sessionsResponse.sessions);
        renderGoals(goalsResponse.goals);
        renderActivity(notificationResponse.notifications);
    } catch (error) {
        toast(error.message, "danger");
    }
}

loadDashboard();
