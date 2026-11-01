(function () {
    if (window.__nexoraChatbotLoaded) return;
    window.__nexoraChatbotLoaded = true;

    const STORE_KEY = "nexora-chatbot-history";
    const GREETING =
        "Hi! 👋 I'm Nexora Assistant. I can help with sessions, requests, credits, your account and more. What do you need help with?";
    const QUICK = ["How do credits work?", "Reset my password", "How do I book a session?", "Report a user"];

    let history = [];
    let busy = false;

    try {
        history = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]");
    } catch {
        history = [];
    }

    function save() {
        try {
            sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-20)));
        } catch {}
    }

    /* ---------- build UI ---------- */
    const toggle = document.createElement("button");
    toggle.id = "nxBotToggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open support chat");
    toggle.textContent = "💬";

    const panel = document.createElement("div");
    panel.id = "nxBotPanel";
    panel.innerHTML = `
        <div class="nxbot-header">
            <div><strong>Nexora Assistant</strong><small>Ask me anything about Nexora</small></div>
            <button type="button" class="nxbot-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="nxbot-messages" id="nxBotMessages"></div>
        <div class="nxbot-chips" id="nxBotChips"></div>
        <div class="nxbot-human" id="nxBotHuman">
            Still stuck? <button type="button" id="nxBotTicket">Talk to a human</button>
        </div>
        <form class="nxbot-form" id="nxBotForm" autocomplete="off">
            <input type="text" id="nxBotInput" placeholder="Type your question..." maxlength="1000" />
            <button type="submit" id="nxBotSend">Send</button>
        </form>`;

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    const messagesEl = panel.querySelector("#nxBotMessages");
    const chipsEl = panel.querySelector("#nxBotChips");
    const humanEl = panel.querySelector("#nxBotHuman");
    const inputEl = panel.querySelector("#nxBotInput");
    const sendBtn = panel.querySelector("#nxBotSend");

    /* ---------- helpers ---------- */
    function addBubble(text, kind) {
        const div = document.createElement("div");
        div.className = "nxbot-msg " + kind;
        div.textContent = text; // textContent keeps output safe from HTML injection
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
    }

    function renderHistory() {
        messagesEl.innerHTML = "";
        addBubble(GREETING, "bot");
        history.forEach((m) => addBubble(m.content, m.role === "user" ? "user" : "bot"));
        chipsEl.style.display = history.length ? "none" : "flex";
    }

    function authHeaders() {
        const headers = { "Content-Type": "application/json" };
        const token = localStorage.getItem("token");
        if (token) headers.Authorization = "Bearer " + token;
        return headers;
    }

    /* ---------- send message ---------- */
    async function sendMessage(text) {
        text = String(text || "").trim();
        if (!text || busy) return;

        busy = true;
        sendBtn.disabled = true;
        chipsEl.style.display = "none";

        history.push({ role: "user", content: text });
        addBubble(text, "user");
        inputEl.value = "";
        save();

        const typing = addBubble("Typing...", "bot");

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ messages: history }),
            });
            const data = await res.json().catch(() => ({}));
            typing.remove();

            if (!res.ok || !data.reply) {
                addBubble(data.message || "Something went wrong. Please try again.", "error");
            } else {
                history.push({ role: "assistant", content: data.reply });
                addBubble(data.reply, "bot");
                save();
                humanEl.classList.toggle("highlight", !!data.escalate);
                if (data.escalate) {
                    addBubble('I can\'t fully solve this one. Tap "Talk to a human" below to create a support ticket.', "bot");
                }
            }
        } catch {
            typing.remove();
            addBubble("Network error. Please check your connection.", "error");
        }

        busy = false;
        sendBtn.disabled = false;
        inputEl.focus();
    }

    /* ---------- create support ticket ---------- */
    async function createTicket() {
        if (!history.some((m) => m.role === "user")) {
            addBubble("Please describe your problem first, then I can create a ticket for you.", "bot");
            return;
        }

        const body = { messages: history };

        if (!localStorage.getItem("token")) {
            const email = window.prompt("Enter your email so our team can reply to you:");
            if (!email) return;
            body.email = email;
        }

        try {
            const res = await fetch("/api/chatbot/ticket", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => ({}));
            addBubble(
                data.message || (res.ok ? "Ticket created." : "Could not create the ticket."),
                res.ok ? "bot" : "error"
            );
            if (res.ok) humanEl.classList.remove("highlight");
        } catch {
            addBubble("Network error. Please try again.", "error");
        }
    }

    /* ---------- events ---------- */
    QUICK.forEach((q) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "nxbot-chip";
        chip.textContent = q;
        chip.addEventListener("click", () => sendMessage(q));
        chipsEl.appendChild(chip);
    });

    toggle.addEventListener("click", () => {
        panel.classList.toggle("open");
        if (panel.classList.contains("open")) inputEl.focus();
    });
    panel.querySelector(".nxbot-close").addEventListener("click", () => panel.classList.remove("open"));
    panel.querySelector("#nxBotForm").addEventListener("submit", (e) => {
        e.preventDefault();
        sendMessage(inputEl.value);
    });
    panel.querySelector("#nxBotTicket").addEventListener("click", createTicket);

    renderHistory();
})();