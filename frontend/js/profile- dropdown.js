
(() => {
  function initProfileDropdown() {
    const profileSelectors = [
      "#profileIcon",
      "#profileBtn",
      "#profileButton",
      ".profile-icon",
      ".profile-avatar",
      ".user-avatar",
      ".nav-profile",
      ".navbar-profile",
      "[aria-label='Profile']"
    ];

    const profileButton = profileSelectors
      .map(selector => document.querySelector(selector))
      .find(Boolean);

    if (!profileButton) {
      console.warn(
        "Profile dropdown: Existing profile button was not found. Check its HTML selector."
      );
      return;
    }

    if (document.getElementById("nexora-profile-menu")) return;

    const menu = document.createElement("div");
    menu.id = "nexora-profile-menu";
    menu.hidden = true;

    menu.innerHTML = `
      <div class="nexora-profile-heading">My Account</div>
      <a href="/pages/dashboard.html">Dashboard</a>
      <a href="/pages/profile.html">My Profile</a>
      <a href="/pages/profile.html?edit=true">Edit Profile</a>
      <a href="/pages/chat.html">Chat / Messages</a>
      <a href="/pages/notifications.html">Notifications</a>
      <a href="/pages/sessions.html">My Sessions</a>
      <a href="#settings" data-menu-action="settings">Settings</a>
      <button type="button" data-menu-action="appearance">
        Appearance: Toggle dark preview
      </button>
      <a href="/pages/contact.html">Help &amp; Support</a>
      <button type="button" class="nexora-profile-logout"
        data-menu-action="logout">Log Out</button>
    `;

    document.body.appendChild(menu);

    const css = document.createElement("style");
    css.textContent = `
      #nexora-profile-menu {
        position: fixed;
        top: 100px;
        right: 120px;
        z-index: 100000;
        width: 250px;
        max-height: 75vh;
        overflow-y: auto;
        padding: 8px;
        background: #fff;
        color: #172033;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 12px 35px #0002;
        font: 14px Arial, sans-serif;
      }
      #nexora-profile-menu[hidden] { display: none; }
      #nexora-profile-menu a,
      #nexora-profile-menu button {
        box-sizing: border-box;
        display: block;
        width: 100%;
        padding: 11px 12px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: inherit;
        text-decoration: none;
        text-align: left;
        font: inherit;
        cursor: pointer;
      }
      #nexora-profile-menu a:hover,
      #nexora-profile-menu button:hover {
        background: #eef2ff;
      }
      #nexora-profile-menu .nexora-profile-heading {
        padding: 12px;
        font-weight: bold;
        border-bottom: 1px solid #e2e8f0;
      }
      #nexora-profile-menu .nexora-profile-logout {
        margin-top: 6px;
        border-top: 1px solid #e2e8f0;
        color: #dc2626;
      }
    `;
    document.head.appendChild(css);

    profileButton.setAttribute("aria-haspopup", "true");
    profileButton.setAttribute("aria-expanded", "false");

    profileButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      menu.hidden = !menu.hidden;
      profileButton.setAttribute("aria-expanded", String(!menu.hidden));
    });

    document.addEventListener("click", event => {
      if (!menu.contains(event.target) && !profileButton.contains(event.target)) {
        menu.hidden = true;
        profileButton.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        menu.hidden = true;
        profileButton.setAttribute("aria-expanded", "false");
      }
    });

    menu.addEventListener("click", event => {
      const button = event.target.closest("[data-menu-action]");
      if (!button) return;

      const action = button.dataset.menuAction;

      if (action === "appearance") {
        document.body.classList.toggle("nexora-dark-preview");
        return;
      }

      if (action === "settings") {
        event.preventDefault();
        alert("Connect this option to your existing Settings page.");
        menu.hidden = true;
        return;
      }

      if (action === "logout") {
        alert("Connect this option to your existing logout function.");
        menu.hidden = true;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileDropdown);
  } else {
    initProfileDropdown();
  }
})();
