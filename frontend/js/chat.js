requireAuth();

const me = getUser();
let socket = window.nexoraSocket;
let currentPartnerId = null;

const partnerSelect = document.getElementById("partner");
const partnerInfo = document.getElementById("partnerInfo");
const messagesContainer = document.getElementById("messages");
const form = document.getElementById("form");
const textInput = document.getElementById("text");
const status = document.getElementById("status");

function addMessage(message) {
    const senderId = message.sender?._id || message.sender;
    const mine = String(senderId) === String(me._id);
    const wrapper = document.createElement("div");
    wrapper.className = `mb-3 ${mine ? "text-end" : ""}`;

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${mine ? "mine" : "theirs"}`;
    bubble.textContent = message.text;

    const time = document.createElement("div");
    time.className = "small text-secondary mt-1";
    time.textContent = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function loadPartners() {
    try {
        const data = await api("/users");
        partnerSelect.innerHTML = `<option value="">Select a partner...</option>` + data.users.map((user) => `<option value="${user._id}">${escapeHtml(user.name)} — ${escapeHtml(user.email)}</option>`).join("");

        const requestedUser = new URLSearchParams(window.location.search).get("userId");
        if (requestedUser && data.users.some((user) => user._id === requestedUser)) {
            partnerSelect.value = requestedUser;
            await openChat(requestedUser);
        }
    } catch (error) {
        toast(error.message, "danger");
    }
}

async function openChat(userId) {
    if (!userId) return;
    currentPartnerId = userId;
    messagesContainer.innerHTML = `<div class="loading-state">Loading conversation...</div>`;

    try {
        const data = await api(`/messages/with/${userId}`);
        partnerInfo.textContent = `Chatting with ${data.partner.name}`;
        messagesContainer.innerHTML = "";
        data.messages.forEach(addMessage);
        await api(`/messages/with/${userId}/read`, { method: "PUT" });
        refreshNotificationCount();

        if (socket) socket.emit("join_chat", userId);
    } catch (error) {
        messagesContainer.innerHTML = `<div class="alert alert-danger m-3">${escapeHtml(error.message)}</div>`;
    }
}

partnerSelect.addEventListener("change", () => openChat(partnerSelect.value));

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentPartnerId) return toast("Please choose a partner.", "warning");

    const message = textInput.value.trim();
    if (!message) return;

    if (!socket || !socket.connected) {
        return toast("Chat is not connected. Refresh and try again.", "danger");
    }

    socket.emit("send_message", { receiver: currentPartnerId, text: message });
    textInput.value = "";
    textInput.focus();
});

function setupSocket() {
    if (!socket && typeof io === "function") {
        socket = io({ auth: { token: getToken() } });
        window.nexoraSocket = socket;
    }
    if (!socket) {
        status.textContent = "Chat unavailable";
        return;
    }

    socket.on("connect", () => { status.textContent = "● Connected — messages update instantly"; });
    socket.on("connect_error", () => { status.textContent = "Chat connection failed. Please refresh."; });
    socket.on("new_message", (message) => {
        if (String(message.sender?._id) === String(currentPartnerId)) {
            addMessage(message);
            api(`/messages/with/${currentPartnerId}/read`, { method: "PUT" }).catch(() => {});
        }
    });
    socket.on("message_sent", (message) => {
        if (String(message.receiver?._id) === String(currentPartnerId)) addMessage(message);
    });
}

setupSocket();
loadPartners();
