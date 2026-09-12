const API = "/api";

function getToken() {
    return localStorage.getItem("token");
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

function saveAuth(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
}

async function api(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(API + path, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({
        message: "Unexpected server response.",
    }));

    if (response.status === 401 && token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.endsWith("login.html")) {
            window.location.href = "/pages/login.html";
        }
    }

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

function requireAuth() {
    if (!getToken()) window.location.href = "/pages/login.html";
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[char]);
}

function toast(message, type = "success") {
    let wrap = document.querySelector(".toast-wrap");

    if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "toast-wrap";
        document.body.appendChild(wrap);
    }

    const item = document.createElement("div");
    item.className = `alert alert-${type} shadow-sm mb-2`;
    item.textContent = message;
    wrap.appendChild(item);

    window.setTimeout(() => item.remove(), 3500);
}

function activePage() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    return page === "index.html" ? "home" : page.replace(".html", "");
}

function renderNavbar() {
    const host = document.getElementById("appNav");

    if (!host) {
        return;
    }

    const user = getUser();
    const page = activePage();

    // Public navbar
    if (!user) {
        host.innerHTML = `
            <nav class="navbar navbar-expand-lg app-navbar sticky-top">
                <div class="container-fluid container-xxl px-3 px-lg-4">

                    <a
                        class="navbar-brand brand-logo"
                        href="/"
                        aria-label="Nexora home"
                    >
                        <img
                            src="/assets/nexora-logo.png"
                            alt="Nexora - Peer Skill Exchange"
                        >
                    </a>

                    <button
                        class="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNav"
                        aria-controls="mainNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div
                        class="collapse navbar-collapse"
                        id="mainNav"
                    >
                        <div class="navbar-nav ms-auto align-items-lg-center">

                            <a
                                class="nav-link ${page === "home" ? "active" : ""}"
                                href="/"
                            >
                                Home
                            </a>

                            <a
                                class="nav-link"
                                href="/pages/find-skills.html"
                            >
                                Explore
                            </a>

                            <a
                                class="nav-link"
                                href="/pages/login.html"
                            >
                                Login
                            </a>

                            <a
                                class="btn btn-primary btn-sm px-3 ms-lg-2"
                                href="/pages/register.html"
                            >
                                Get Started
                            </a>

                        </div>
                    </div>

                </div>
            </nav>
        `;

        return;
    }

    const initial = escapeHtml(
        (user.name || user.email || "S")
            .charAt(0)
            .toUpperCase()
    );

    const displayName = escapeHtml(
        user.name || "Student"
    );

    const mainLinks = [
        ["dashboard", "Dashboard", "/pages/dashboard.html"],
        ["find-skills", "Find Skills", "/pages/find-skills.html"],
        ["matches", "Matches", "/pages/matches.html"],
        ["requests", "Requests", "/pages/requests.html"],
        ["sessions", "Sessions", "/pages/sessions.html"],
        ["chat", "Chat", "/pages/chat.html"],
    ];

    const navLinks = mainLinks
        .map(([key, label, href]) => `
            <a
                class="nav-link ${page === key ? "active" : ""}"
                href="${href}"
            >
                ${label}
            </a>
        `)
        .join("");

    const moreActivePages = [
        "calendar",
        "analytics",
        "credits",
        "study-groups",
        "contact",
        "admin",
    ];

    const moreIsActive = moreActivePages.includes(page);

    const adminLink = user.role === "admin"
        ? `
            <a
                class="dropdown-item ${page === "admin" ? "active" : ""}"
                href="/pages/admin.html"
            >
                <span class="more-icon">⚙️</span>
                <span>Admin</span>
            </a>
        `
        : "";

    host.innerHTML = `
        <nav class="navbar navbar-expand-xl app-navbar sticky-top">

            <div class="container-fluid container-xxl px-3 px-lg-4">

                <!-- Brand -->

                <a
                    class="navbar-brand brand-logo"
                    href="/pages/dashboard.html"
                    aria-label="Nexora dashboard"
                >
                    <img
                        src="/assets/nexora-logo.png"
                        alt="Nexora - Peer Skill Exchange"
                    >
                </a>


                <!-- Mobile menu button -->

                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNav"
                    aria-controls="mainNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>


                <!-- Navigation -->

                <div
                    class="collapse navbar-collapse"
                    id="mainNav"
                >

                    <div class="navbar-nav mx-xl-auto nav-main-links">

                        ${navLinks}


                        <!-- More Menu -->

                        <div class="nav-item dropdown">

                            <a
                                class="nav-link dropdown-toggle ${moreIsActive ? "active" : ""}"
                                href="#"
                                id="moreMenu"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                More
                            </a>

                            <ul
                                class="dropdown-menu dropdown-menu-end more-menu"
                                aria-labelledby="moreMenu"
                            >

                                <li>
                                    <a
                                        class="dropdown-item ${page === "calendar" ? "active" : ""}"
                                        href="/pages/calendar.html"
                                    >
                                        <span class="more-icon">📅</span>
                                        <span>Calendar</span>
                                    </a>
                                </li>

                                <li>
                                    <a
                                        class="dropdown-item ${page === "analytics" ? "active" : ""}"
                                        href="/pages/analytics.html"
                                    >
                                        <span class="more-icon">📊</span>
                                        <span>Analytics</span>
                                    </a>
                                </li>

                                <li>
                                    <a
                                        class="dropdown-item ${page === "credits" ? "active" : ""}"
                                        href="/pages/credits.html"
                                    >
                                        <span class="more-icon">💰</span>
                                        <span>Credits</span>
                                    </a>
                                </li>

                                <li>
                                    <a
                                        class="dropdown-item ${page === "study-groups" ? "active" : ""}"
                                        href="/pages/study-groups.html"
                                    >
                                        <span class="more-icon">👥</span>
                                        <span>Study Groups</span>
                                    </a>
                                </li>

                                <li>
                                    <a
                                        class="dropdown-item ${page === "contact" ? "active" : ""}"
                                        href="/pages/contact.html"
                                    >
                                        <span class="more-icon">📩</span>
                                        <span>Contact Us</span>
                                    </a>
                                </li>

                                ${adminLink}

                            </ul>

                        </div>

                    </div>


                    <!-- Right side -->

                    <div class="navbar-tools">

                        <!-- Notifications -->

                        <a
                            class="nav-tool notification-tool ${page === "notifications" ? "active" : ""}"
                            href="/pages/notifications.html"
                            aria-label="Notifications"
                        >
                            <span class="tool-icon">🔔</span>

                            <span
                                id="notifCount"
                                class="notification-badge d-none"
                            >
                                0
                            </span>
                        </a>


                        <!-- Profile -->

                        <a
                            class="nav-tool profile-tool ${page === "profile" ? "active" : ""}"
                            href="/pages/profile.html"
                            aria-label="Profile"
                        >
                            <span
                                class="nav-avatar"
                                id="navbarAvatar"
                            >
                                ${initial}
                            </span>

                            <span
                                id="navbarUserName"
                                class="tool-label user-name"
                            >
                                ${displayName}
                            </span>
                        </a>


                        <!-- Logout -->

                        <button
                            class="btn btn-sm btn-outline-danger logout-btn"
                            type="button"
                            id="logoutBtn"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </div>

        </nav>
    `;

    document
        .getElementById("logoutBtn")
        ?.addEventListener("click", logout);
}

async function refreshNotificationCount() {
    const badge = document.getElementById("notifCount");
    if (!badge || !getToken()) return;

    try {
        const data = await api("/notifications");
        badge.textContent = data.unread || 0;
        badge.classList.toggle("d-none", !data.unread);
    } catch {
        badge.textContent = "0";
    }
}

function connectGlobalSocket() {
    if (!getToken() || typeof io !== "function" || window.nexoraSocket) return;

    window.nexoraSocket = io({ auth: { token: getToken() } });
    window.nexoraSocket.on("notification", () => {
        refreshNotificationCount();
    });
    window.nexoraSocket.on("chat_error", (data) => {
        if (data?.message) toast(data.message, "danger");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    refreshNotificationCount();
    connectGlobalSocket();
    window.setInterval(refreshNotificationCount, 30000);
});
