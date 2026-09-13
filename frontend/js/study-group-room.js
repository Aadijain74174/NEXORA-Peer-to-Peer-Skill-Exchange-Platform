const API_BASE = "/api/study-groups";
const MESSAGE_API = "/api/group-messages";
const SESSION_API = "/api/sessions";

let groupSocket = null;
let currentGroupId = null;
let currentGroup = null;

const roomStatus = document.getElementById("roomStatus");
const membersList = document.getElementById("membersList");
const groupName = document.getElementById("groupName");
const groupSkill = document.getElementById("groupSkill");
const groupLevel = document.getElementById("groupLevel");
const groupDescription = document.getElementById("groupDescription");
const groupMembersCount = document.getElementById("groupMembersCount");
const groupCreator = document.getElementById("groupCreator");
const leaveGroupBtn = document.getElementById("leaveGroupBtn");
const groupChatMessages = document.getElementById("groupChatMessages");
const groupChatForm = document.getElementById("groupChatForm");
const groupChatInput = document.getElementById("groupChatInput");
const scheduleGroupSessionBtn = document.getElementById("scheduleGroupSessionBtn");
const groupSessionsContainer = document.getElementById("groupSessionsContainer");
const groupSessionModalElement = document.getElementById("groupSessionModal");
const groupSessionForm = document.getElementById("groupSessionForm");
const sessionDate = document.getElementById("sessionDate");
const sessionTime = document.getElementById("sessionTime");
const sessionDuration = document.getElementById("sessionDuration");
const sessionMode = document.getElementById("sessionMode");
const sessionMeetingLink = document.getElementById("sessionMeetingLink");

function getToken() {
    return localStorage.getItem("token");
}

function getGroupId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?._id || user?.id || null;
    } catch {
        return null;
    }
}

function showStatus(message, type = "info") {
    if (!roomStatus) return;

    roomStatus.innerHTML = `
        <div class="alert alert-${type}">
            ${escapeHtml(message)}
        </div>
    `;
}

function clearStatus() {
    if (roomStatus) roomStatus.innerHTML = "";
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value || "";
    return div.innerHTML;
}

async function loadGroup() {
    const groupId = getGroupId();
    currentGroupId = groupId;

    if (!groupId) {
        showStatus("Study group ID is missing.", "danger");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${groupId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load study group."
            );
        }

        currentGroup = result.data;

        renderGroup(result.data);
        await loadGroupMessages();
        await loadGroupSessions();
    } catch (error) {
        console.error("Load study group error:", error);

        showStatus(
            error.message || "Unable to load study group.",
            "danger"
        );
    }
}

function renderGroup(group) {
    groupName.textContent = group.name;
    groupSkill.textContent = `Skill: ${group.skill}`;
    groupLevel.textContent = group.level;
    groupDescription.textContent =
        group.description || "No description provided.";

    const members = group.members || [];

    groupMembersCount.textContent =
        `👥 Members: ${members.length}/${group.maxMembers}`;

    groupCreator.textContent =
        `Created by: ${group.creator?.name || "Nexora Member"}`;

    renderMembers(members);
    updateMembershipButtons(group);
}

function renderMembers(members) {
    membersList.innerHTML = "";

    if (!members.length) {
        membersList.innerHTML =
            `<p class="text-muted">No members found.</p>`;
        return;
    }

    members.forEach((member) => {
        const element = document.createElement("div");

        element.className =
            "d-flex align-items-center gap-3 border-bottom py-2";

        const initial =
            (member.name || "U").charAt(0).toUpperCase();

        element.innerHTML = `
            <div
                class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style="width: 40px; height: 40px; flex-shrink: 0;"
            >
                ${escapeHtml(initial)}
            </div>

            <div>
                <div class="fw-semibold">
                    ${escapeHtml(member.name || "Nexora Member")}
                </div>

                <div class="small text-muted">
                    ${escapeHtml(member.email || "")}
                </div>
            </div>
        `;

        membersList.appendChild(element);
    });
}

function updateMembershipButtons(group) {
    const userId = getCurrentUserId();

    if (!userId) {
        leaveGroupBtn.disabled = true;
        return;
    }

    const creatorId =
        group.creator?._id || group.creator?.toString();

    const isCreator =
        String(creatorId) === String(userId);

    const isMember =
        (group.members || []).some((member) =>
            String(member._id || member.toString()) ===
            String(userId)
        );

    if (isCreator) {
        leaveGroupBtn.disabled = true;
        leaveGroupBtn.textContent =
            "Creator cannot leave group";
    } else if (isMember) {
        leaveGroupBtn.disabled = false;
        leaveGroupBtn.textContent = "Leave Group";
    } else {
        leaveGroupBtn.disabled = true;
        leaveGroupBtn.textContent = "Join the group first";
    }
}

async function loadGroupMessages() {
    const token = getToken();
    const groupId = getGroupId();

    if (!token || !groupId) return;

    try {
        const response = await fetch(
            `${MESSAGE_API}/${groupId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load messages."
            );
        }

        renderMessages(result.data);
    } catch (error) {
        console.error(
            "Load group messages error:",
            error
        );

        groupChatMessages.innerHTML = `
            <div class="text-danger text-center py-5">
                Unable to load group chat.
            </div>
        `;
    }
}

function renderMessages(messages) {
    groupChatMessages.innerHTML = "";

    if (!messages || messages.length === 0) {
        groupChatMessages.innerHTML = `
            <div class="text-muted text-center py-5">
                No messages yet. Start the conversation!
            </div>
        `;

        return;
    }

    messages.forEach((message) => {
        appendMessage(message);
    });

    scrollChatToBottom();
}

function appendMessage(message) {
    const currentUserId = getCurrentUserId();

    const senderId =
        message.sender?._id || message.sender;

    const isMine =
        String(senderId) === String(currentUserId);

    const messageElement =
        document.createElement("div");

    messageElement.className =
        `mb-3 d-flex ${
            isMine
                ? "justify-content-end"
                : "justify-content-start"
        }`;

    messageElement.dataset.messageId = message._id;

    const senderName = isMine
        ? "You"
        : message.sender?.name || "Nexora Member";

    const time = message.createdAt
        ? new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

    const messageText = message.deleted
        ? "This message was deleted for everyone."
        : message.text;

    const deletedClass =
        message.deleted ? "deleted-message" : "";

    messageElement.innerHTML = `
        <div class="group-message-wrapper ${
            isMine ? "mine" : "theirs"
        }">
            <div class="group-message-row">
                <div class="group-message-content p-3 rounded-3 ${
                    isMine
                        ? "bg-primary text-white"
                        : "bg-light"
                } ${deletedClass}">
                    <div class="small fw-semibold mb-1">
                        ${escapeHtml(senderName)}
                    </div>

                    <div class="group-message-text">
                        ${escapeHtml(messageText)}
                    </div>

                    <div class="small mt-1 ${
                        isMine
                            ? "text-white-50"
                            : "text-muted"
                    }">
                        ${escapeHtml(time)}
                    </div>
                </div>

                ${
                    isMine && !message.deleted
                        ? `
                            <button
                                type="button"
                                class="group-delete-btn"
                                title="Message options"
                                aria-label="Message options"
                            >
                                ⋮
                            </button>
                        `
                        : ""
                }
            </div>
        </div>
    `;

    if (isMine && !message.deleted) {
        const deleteButton =
            messageElement.querySelector(
                ".group-delete-btn"
            );

        deleteButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                showMessageMenu(
                    messageElement,
                    message._id
                );
            }
        );
    }

    groupChatMessages.appendChild(messageElement);
}

function showMessageMenu(messageElement, messageId) {
    document
        .querySelectorAll(".group-message-menu")
        .forEach((menu) => menu.remove());

    const deleteButton =
        messageElement.querySelector(
            ".group-delete-btn"
        );

    if (!deleteButton) return;

    const menu = document.createElement("div");

    menu.className = "group-message-menu";

    menu.innerHTML = `
        <button
            type="button"
            class="group-menu-delete"
        >
            🗑 Delete for everyone
        </button>
    `;

    const wrapper =
        messageElement.querySelector(
            ".group-message-wrapper"
        );

    wrapper.style.position = "relative";
    wrapper.appendChild(menu);

    menu
        .querySelector(".group-menu-delete")
        .addEventListener("click", () => {
            menu.remove();
            deleteGroupMessage(messageId);
        });

    setTimeout(() => {
        document.addEventListener(
            "click",
            function closeMenu(event) {
                if (
                    !menu.contains(event.target) &&
                    event.target !== deleteButton
                ) {
                    menu.remove();

                    document.removeEventListener(
                        "click",
                        closeMenu
                    );
                }
            }
        );
    }, 0);
}

async function deleteGroupMessage(messageId) {
    const existingModal =
        document.getElementById(
            "deleteConfirmModal"
        );

    if (existingModal) {
        existingModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.id = "deleteConfirmModal";
    modal.className = "delete-confirm-overlay";

    modal.innerHTML = `
        <div class="delete-confirm-box">
            <div class="delete-confirm-icon">
                🗑️
            </div>

            <h5>Delete message?</h5>

            <p>
                This message will be deleted
                for everyone in this group.
            </p>

            <div class="delete-confirm-actions">
                <button
                    type="button"
                    class="btn btn-light"
                    id="cancelDeleteBtn"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="btn btn-danger"
                    id="confirmDeleteBtn"
                >
                    Delete for everyone
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("cancelDeleteBtn")
        .addEventListener("click", () => {
            modal.remove();
        });

    document
        .getElementById("confirmDeleteBtn")
        .addEventListener(
            "click",
            async () => {
                const token = getToken();
                const groupId = getGroupId();

                if (!token || !groupId) {
                    modal.remove();

                    showStatus(
                        "Please login first.",
                        "warning"
                    );

                    return;
                }

                const confirmButton =
                    document.getElementById(
                        "confirmDeleteBtn"
                    );

                confirmButton.disabled = true;
                confirmButton.textContent =
                    "Deleting...";

                try {
                    const response =
                        await fetch(
                            `${MESSAGE_API}/${groupId}/${messageId}`,
                            {
                                method: "DELETE",
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            }
                        );

                    const result =
                        await response.json();

                    if (
                        !response.ok ||
                        !result.success
                    ) {
                        throw new Error(
                            result.message ||
                            "Unable to delete message."
                        );
                    }

                    modal.remove();

                    updateDeletedGroupMessage(
                        messageId
                    );

                    showStatus(
                        "Message deleted for everyone.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Delete group message error:",
                        error
                    );

                    modal.remove();

                    showStatus(
                        error.message ||
                        "Unable to delete message.",
                        "danger"
                    );
                }
            }
        );

    modal.addEventListener(
        "click",
        (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        }
    );
}

function updateDeletedGroupMessage(messageId) {
    const messageElement =
        groupChatMessages.querySelector(
            `[data-message-id="${messageId}"]`
        );

    if (!messageElement) return;

    const textElement =
        messageElement.querySelector(
            ".group-message-text"
        );

    if (textElement) {
        textElement.textContent =
            "This message was deleted for everyone.";
    }

    const deleteButton =
        messageElement.querySelector(
            ".group-delete-btn"
        );

    if (deleteButton) {
        deleteButton.remove();
    }

    const content =
        messageElement.querySelector(
            ".group-message-content"
        );

    if (content) {
        content.classList.add(
            "deleted-message"
        );
    }
}

function sendGroupMessage(event) {
    event.preventDefault();

    const text =
        groupChatInput.value.trim();

    if (!text) return;

    const groupId = getGroupId();
    const token = getToken();

    if (!token) {
        showStatus(
            "Please login first.",
            "warning"
        );

        return;
    }

    if (!groupId) {
        showStatus(
            "Study group ID is missing.",
            "danger"
        );

        return;
    }

    if (
        !groupSocket ||
        !groupSocket.connected
    ) {
        showStatus(
            "Group chat is not connected. Please refresh.",
            "danger"
        );

        return;
    }

    groupSocket.emit(
        "send_group_message",
        {
            groupId,
            text,
        }
    );

    groupChatInput.value = "";
    groupChatInput.focus();
}

function scrollChatToBottom() {
    groupChatMessages.scrollTop =
        groupChatMessages.scrollHeight;
}

async function leaveGroup() {
    const token = getToken();
    const groupId = getGroupId();

    if (!token) {
        showStatus(
            "Please login first.",
            "warning"
        );

        return;
    }

    if (!groupId) return;

    const confirmed =
        window.confirm(
            "Are you sure you want to leave this study group?"
        );

    if (!confirmed) return;

    try {
        const response =
            await fetch(
                `${API_BASE}/${groupId}/leave`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Unable to leave group."
            );
        }

        showStatus(
            "You left the study group.",
            "success"
        );

        setTimeout(() => {
            window.location.href =
                "/pages/study-groups.html";
        }, 1000);
    } catch (error) {
        console.error(
            "Leave group error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to leave group.",
            "danger"
        );
    }
}

function openScheduleSessionModal() {
    if (!getToken()) {
        showStatus(
            "Please login first.",
            "warning"
        );

        return;
    }

    if (!currentGroup) {
        showStatus(
            "Study group is still loading.",
            "warning"
        );

        return;
    }

    const todayString =
        new Date()
            .toISOString()
            .split("T")[0];

    if (sessionDate) {
        sessionDate.min = todayString;

        if (!sessionDate.value) {
            sessionDate.value =
                todayString;
        }
    }

    if (sessionDuration) {
        sessionDuration.value = 60;
    }

    if (sessionMode) {
        sessionMode.value = "Online";
    }

    if (sessionMeetingLink) {
        sessionMeetingLink.value = "";
    }

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            groupSessionModalElement
        );

    modal.show();
}

async function scheduleGroupSession(event) {
    event.preventDefault();

    const token = getToken();
    const groupId = getGroupId();

    if (!token) {
        showStatus(
            "Please login first.",
            "warning"
        );
        return;
    }

    if (!groupId) {
        showStatus(
            "Study group ID is missing.",
            "danger"
        );
        return;
    }

    if (!currentGroup) {
        showStatus(
            "Study group information is not loaded.",
            "danger"
        );
        return;
    }

    const date = sessionDate.value.trim();
    const time = sessionTime.value.trim();
    const duration = Number(sessionDuration.value);
    const mode = sessionMode.value;
    const meetingLink = sessionMeetingLink.value.trim();

    if (!date || !time) {
        showStatus(
            "Please select date and starting time.",
            "warning"
        );
        return;
    }

    if (!duration || duration < 15 || duration > 240) {
        showStatus(
            "Duration must be between 15 and 240 minutes.",
            "warning"
        );
        return;
    }

    if (mode === "Online" && meetingLink) {
        try {
            const parsed = new URL(meetingLink);

            if (!["http:", "https:"].includes(parsed.protocol)) {
                throw new Error();
            }
        } catch {
            showStatus(
                "Please enter a valid meeting link.",
                "warning"
            );
            return;
        }
    }

    const submitButton =
        groupSessionForm.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Scheduling...";
    }

    try {
        const response = await fetch(
            "/api/sessions/group",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    groupId: groupId,
                    skill: currentGroup.skill,
                    date,
                    time,
                    duration,
                    mode,
                    meetingLink,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to schedule session."
            );
        }

        const modal =
            bootstrap.Modal.getInstance(
                groupSessionModalElement
            );

        if (modal) {
            modal.hide();
        }

        groupSessionForm.reset();
        sessionDuration.value = 60;

        showStatus(
            "Session scheduled successfully!",
            "success"
        );

        await loadGroupSessions();

    } catch (error) {
        console.error(
            "Schedule group session error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to schedule session.",
            "danger"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Schedule Session";
        }
    }
}

async function loadGroupSessions() {
    const token = getToken();

    if (!token) {
        groupSessionsContainer.innerHTML = `
            <div class="text-muted text-center py-4">
                Please login to view sessions.
            </div>
        `;

        return;
    }

    try {
        const response =
            await fetch(
                SESSION_API,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Unable to load sessions."
            );
        }

        const sessions =(result.sessions || []).filter(
                (session) =>
                    String(
                        session.studyGroup?._id ||
                        session.studyGroup
                    ) === String(currentGroupId)
            );

        renderGroupSessions(sessions);
    } catch (error) {
        console.error(
            "Load group sessions error:",
            error
        );

        groupSessionsContainer.innerHTML = `
            <div class="text-danger text-center py-4">
                Unable to load group sessions.
            </div>
        `;
    }
}

function renderGroupSessions(sessions) {
    groupSessionsContainer.innerHTML = "";

    if (!sessions || sessions.length === 0) {
        groupSessionsContainer.innerHTML = `
            <div class="text-muted text-center py-4">
                No group sessions scheduled yet.
            </div>
        `;

        return;
    }

    const currentUserId = String(getCurrentUserId());

    sessions.forEach((session) => {
        const element = document.createElement("div");

        element.className = "border rounded p-3 mb-3";

        const teacherId = String(
            session.teacher?._id || session.teacher || ""
        );

        const learnerId = String(
            session.learner?._id || session.learner || ""
        );

        const isParticipant =
            currentUserId === teacherId ||
            currentUserId === learnerId;

        const groupMembers =
            session.studyGroup?.members ||
            currentGroup?.members ||
            [];

        const participantNames = groupMembers
            .map((member) => member?.name)
            .filter(Boolean);

        const participantText =
            participantNames.length > 0
                ? participantNames.join(", ")
                : "All groups Members";

        const statusClass =
            session.status === "Scheduled"
                ? "text-bg-primary"
                : session.status === "Completed"
                    ? "text-bg-success"
                    : "text-bg-secondary";

        element.innerHTML = `
            <div class="d-flex flex-column flex-md-row justify-content-between gap-3">

                <div>

                    <h6 class="fw-bold mb-2">
                        📚 ${escapeHtml(session.skill)}
                    </h6>

                    <div class="small text-muted mb-1">
                        👥 Participants:
                        <strong>
                            ${escapeHtml(participantText)}
                        </strong>
                    </div>

                    <div class="small mb-1">
                        📅 ${escapeHtml(session.date)}
                    </div>

                    <div class="small mb-1">
                        ⏰ ${escapeHtml(session.time)}
                    </div>

                    <div class="small mb-1">
                        ⏱ ${escapeHtml(String(session.duration))} minutes
                    </div>

                    <div class="small mb-1">
                        ${
                            session.mode === "Online"
                                ? "🌐 Online"
                                : "📍 Offline"
                        }
                    </div>

                </div>

                <div class="text-md-end">

                    <span class="badge ${statusClass}">
                        ${escapeHtml(session.status)}
                    </span>

                    ${
                        session.mode === "Online" &&
                        session.meetingLink
                            ? `
                                <div class="mt-3">
                                    <a
                                        href="${escapeHtml(session.meetingLink)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="btn btn-sm btn-outline-primary"
                                    >
                                        Join Meeting
                                    </a>
                                </div>
                            `
                            : ""
                    }

                    ${
                        isParticipant &&
                        session.status === "Scheduled"
                            ? `
                                <div class="mt-3 d-flex gap-2 justify-content-md-end">

                                    <button
                                        type="button"
                                        class="btn btn-sm btn-success complete-session-btn"
                                        data-session-id="${session._id}"
                                    >
                                        ✓ Complete
                                    </button>

                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-danger cancel-session-btn"
                                        data-session-id="${session._id}"
                                    >
                                        ✕ Cancel
                                    </button>

                                </div>
                            `
                            : ""
                    }

                </div>

            </div>
        `;

        groupSessionsContainer.appendChild(element);
    });

    attachGroupSessionActions();
}

function setupGroupSocket() {
    if (typeof io !== "function") {
        console.warn(
            "Socket.IO is not available."
        );

        return;
    }

    const token = getToken();

    if (!token) {
        console.warn(
            "Authentication token not found."
        );

        return;
    }

    groupSocket =
        io({
            auth: {
                token,
            },
        });

    groupSocket.on(
        "connect",
        () => {
            console.log(
                "Group chat socket connected."
            );

            if (currentGroupId) {
                groupSocket.emit(
                    "join_group",
                    currentGroupId
                );
            }
        }
    );

    groupSocket.on(
        "connect_error",
        (error) => {
            console.error(
                "Group socket connection error:",
                error.message
            );
        }
    );

    groupSocket.on(
        "group_joined",
        (data) => {
            console.log(
                "Joined group room:",
                data.groupId
            );
        }
    );

    groupSocket.on(
        "group_chat_error",
        (data) => {
            showStatus(
                data?.message ||
                "Group chat error.",
                "danger"
            );
        }
    );

    groupSocket.on(
        "new_group_message",
        (message) => {
            if (!message) return;

            appendMessage(message);
            scrollChatToBottom();
        }
    );

    groupSocket.on(
        "group_message_deleted",
        (data) => {
            if (!data?.messageId) {
                return;
            }

            updateDeletedGroupMessage(
                data.messageId
            );
        }
    );
}

if (leaveGroupBtn) {
    leaveGroupBtn.addEventListener(
        "click",
        leaveGroup
    );
}

if (groupChatForm) {
    groupChatForm.addEventListener(
        "submit",
        sendGroupMessage
    );
}

if (scheduleGroupSessionBtn) {
    scheduleGroupSessionBtn.addEventListener(
        "click",
        openScheduleSessionModal
    );
}

if (groupSessionForm) {
    groupSessionForm.addEventListener(
        "submit",
        scheduleGroupSession
    );
}

setupGroupSocket();
loadGroup();

function attachGroupSessionActions() {
    document
        .querySelectorAll(".complete-session-btn")
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    completeGroupSession(
                        button.dataset.sessionId
                    );
                }
            );
        });

    document
        .querySelectorAll(".cancel-session-btn")
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    cancelGroupSession(
                        button.dataset.sessionId
                    );
                }
            );
        });
}


async function completeGroupSession(sessionId) {
    const token = getToken();

    if (!token) {
        showStatus(
            "Please login first.",
            "warning"
        );

        return;
    }

    const confirmed = window.confirm(
        "Mark this group session as completed?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${SESSION_API}/${sessionId}/complete`,
            {
                method: "PUT",

                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to complete session."
            );
        }

        showStatus(
            "Group session marked as completed.",
            "success"
        );

        await loadGroupSessions();

    } catch (error) {
        console.error(
            "Complete group session error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to complete group session.",
            "danger"
        );
    }
}


async function cancelGroupSession(sessionId) {
    const token = getToken();

    if (!token) {
        showStatus(
            "Please login first.",
            "warning"
        );

        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to cancel this group session?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${SESSION_API}/${sessionId}/cancel`,
            {
                method: "PUT",

                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to cancel session."
            );
        }

        showStatus(
            "Group session cancelled.",
            "success"
        );

        await loadGroupSessions();

    } catch (error) {
        console.error(
            "Cancel group session error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to cancel group session.",
            "danger"
        );
    }
}