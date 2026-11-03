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
        ["dashboard", "🏠 Dashboard", "/pages/dashboard.html"],
        ["find-skills", "🔍 Find Skills", "/pages/find-skills.html"],
        ["study-groups", "👥 Study Groups", "/pages/study-groups.html"],
        ["sessions", "📅 Sessions", "/pages/sessions.html"],
        ["chat", "💬Chat", "/pages/chat.html"],
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

</div>

<!-- Right side -->

<div class="navbar-tools">

                      

         <!-- COMPLETE PROFILE DROPDOWN -->

<div class="nav-item dropdown profile-dropdown-wrap">

    <button
        class="nav-tool profile-tool profile-dropdown-toggle dropdown-toggle"
        type="button"
        id="profileDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Open profile menu"
    >
        <span class="nav-avatar">${initial}</span>
        <span class="tool-label user-name">${displayName}</span>
    </button>

    <ul
        class="dropdown-menu dropdown-menu-end profile-dropdown-menu"
        aria-labelledby="profileDropdown"
    >

        <!-- USER INFORMATION -->

        <li class="profile-menu-header">

            <div class="profile-menu-avatar">
                ${initial}
            </div>

            <div class="profile-menu-details">

                <div class="profile-menu-name">
                    ${displayName}
                </div>

                <div class="profile-menu-email">
                    ${escapeHtml(user.email || "")}
                </div>

            </div>

        </li>

        <li><hr class="dropdown-divider"></li>


        <!-- ACCOUNT -->

        <li class="profile-menu-section">MY ACCOUNT</li>

        <li>
            <a class="dropdown-item" href="/pages/profile.html">
                <span>👤</span>
                <span>My Profile</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/skills.html">
                <span>🎯</span>
                <span>My Skills</span>
            </a>
        </li>


        <li><hr class="dropdown-divider"></li>


        <!-- SKILL EXCHANGE -->

        <li class="profile-menu-section">SKILL EXCHANGE</li>

        <li>
            <a class="dropdown-item" href="/pages/matches.html">
                <span>🤝</span>
                <span>Matches</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/requests.html">
                <span>📨</span>
                <span>Requests</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/find-skills.html">
                <span>🔍</span>
                <span>Explore Skills</span>
            </a>
        </li>


        <li><hr class="dropdown-divider"></li>


        <!-- LEARNING -->

        <li class="profile-menu-section">LEARNING & PRODUCTIVITY</li>

        <li>
            <a class="dropdown-item" href="/pages/calendar.html">
                <span>📅</span>
                <span>Calendar</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/analytics.html">
                <span>📊</span>
                <span>Analytics</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/credits.html">
                <span>💰</span>
                <span>Credits</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/study-groups.html">
                <span>👥</span>
                <span>Study Groups</span>
            </a>
        </li>


        <li><hr class="dropdown-divider"></li>


        <!-- COMMUNICATION -->

        <li class="profile-menu-section">COMMUNICATION</li>

        <li>
            <a class="dropdown-item" href="/pages/chat.html">
                <span>💬</span>
                <span>Messages</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/notifications.html">
                <span>🔔</span>
                <span>Notifications</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/reviews.html">
                <span>⭐</span>
                <span>Reviews &amp; Ratings</span>
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="/pages/contact.html">
                <span>📩</span>
                <span>Contact Us</span>
            </a>
        </li>


        <!-- ADMIN: ONLY FOR ADMIN USERS -->

        ${user.role === "admin" ? `
            <li><hr class="dropdown-divider"></li>

            <li class="profile-menu-section">ADMINISTRATION</li>

            <li>
                <a class="dropdown-item" href="/pages/admin.html">
                    <span>⚙️</span>
                    <span>Admin Dashboard</span>
                </a>
            </li>
        ` : ""}


        <!-- LOGOUT AT THE BOTTOM -->

        <li><hr class="dropdown-divider"></li>

        <li>
            <button
                class="dropdown-item logout-dropdown"
                type="button"
                id="logoutBtn"
            >
                <span>🚪</span>
                <span>Logout</span>
            </button>
        </li>

            </ul>

            </div>

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

/* Theme management for NEXORA */

function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute(
        "data-theme",
        selectedTheme
    );

    localStorage.setItem("nexora-theme", selectedTheme);

    const button = document.getElementById("themeToggle");

    if (button) {
        const isDark = selectedTheme === "dark";

        button.innerHTML = isDark
            ? '<span class="tool-icon">☀️</span><span class="theme-label">Light</span>'
            : '<span class="tool-icon">🌙</span><span class="theme-label">Dark</span>';

        button.setAttribute(
            "aria-label",
            isDark ? "Switch to light theme" : "Switch to dark theme"
        );

        button.setAttribute("aria-pressed", String(isDark));
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem("nexora-theme") || "light";

    applyTheme(savedTheme);

    const navbarTools = document.querySelector(".navbar-tools");

    if (!navbarTools || document.getElementById("themeToggle")) {
        return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.id = "themeToggle";
    button.className = "nav-tool theme-toggle";
    button.addEventListener("click", () => {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        applyTheme(currentTheme === "dark" ? "light" : "dark");
    });

    navbarTools.prepend(button);

    // Display the correct icon and label.
    applyTheme(savedTheme);
}



document.addEventListener("DOMContentLoaded", () => {
    // Apply the saved theme before rendering the navbar.
    applyTheme(localStorage.getItem("nexora-theme") || "light");

    renderNavbar();

    // Add the toggle after renderNavbar creates the navigation.
    initializeTheme();

    refreshNotificationCount();
    connectGlobalSocket();

    window.setInterval(refreshNotificationCount, 30000);
        const botCss = document.createElement("link");
    botCss.rel = "stylesheet";
    botCss.href = "/css/chatbot.css";
    document.head.appendChild(botCss);

    const botJs = document.createElement("script");
    botJs.src = "/js/chatbot.js";
    document.body.appendChild(botJs);
});
