const API_BASE = "/api/study-groups";
const MESSAGE_API = "/api/group-messages";

let groupSocket = null;
let currentGroupId = null;

const roomStatus = document.getElementById("roomStatus");
const membersList = document.getElementById("membersList");

const groupName = document.getElementById("groupName");
const groupSkill = document.getElementById("groupSkill");
const groupLevel = document.getElementById("groupLevel");
const groupDescription =
    document.getElementById("groupDescription");

const groupMembersCount =
    document.getElementById("groupMembersCount");

const groupCreator =
    document.getElementById("groupCreator");

const leaveGroupBtn =
    document.getElementById("leaveGroupBtn");

const groupChatMessages =
    document.getElementById("groupChatMessages");

const groupChatForm =
    document.getElementById("groupChatForm");

const groupChatInput =
    document.getElementById("groupChatInput");


function getToken() {
    return localStorage.getItem("token");
}


function getGroupId() {
    const params = new URLSearchParams(
        window.location.search
    );

    return params.get("id");
}


function getCurrentUserId() {
    try {
        const user = JSON.parse(
            localStorage.getItem("user")
        );

        return user?._id || user?.id || null;

    } catch {
        return null;
    }
}


function showStatus(message, type = "info") {
    roomStatus.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
}


function escapeHtml(value) {
    const div = document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;
}


/*
 * LOAD GROUP DETAILS
 */
async function loadGroup() {
    const groupId = getGroupId();
    currentGroupId = groupId;

    if (!groupId) {
        showStatus(
            "Study group ID is missing.",
            "danger"
        );

        return;
    }


    try {
        const response = await fetch(
            `${API_BASE}/${groupId}`
        );

        const result = await response.json();


        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to load study group."
            );
        }


        renderGroup(result.data);

        await loadGroupMessages();

    } catch (error) {
        console.error(
            "Load study group error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to load study group.",
            "danger"
        );
    }
}


/*
 * RENDER GROUP
 */
function renderGroup(group) {
    groupName.textContent = group.name;

    groupSkill.textContent =
        `Skill: ${group.skill}`;

    groupLevel.textContent =
        group.level;

    groupDescription.textContent =
        group.description ||
        "No description provided.";


    const members =
        group.members || [];


    groupMembersCount.textContent =
        `👥 Members: ${members.length}/${group.maxMembers}`;


    groupCreator.textContent =
        `Created by: ${
            group.creator?.name ||
            "Nexora Member"
        }`;


    renderMembers(members);

    updateMembershipButtons(group);
}


/*
 * RENDER MEMBERS
 */
function renderMembers(members) {
    membersList.innerHTML = "";


    if (!members.length) {
        membersList.innerHTML = `
            <p class="text-muted">
                No members found.
            </p>
        `;

        return;
    }


    members.forEach((member) => {
        const element =
            document.createElement("div");


        element.className =
            "d-flex align-items-center gap-3 border-bottom py-2";


        const initial =
            (member.name || "U")
                .charAt(0)
                .toUpperCase();


        element.innerHTML = `
            <div
                class="rounded-circle bg-primary text-white
                       d-flex align-items-center justify-content-center"
                style="
                    width: 40px;
                    height: 40px;
                    flex-shrink: 0;
                "
            >
                ${escapeHtml(initial)}
            </div>

            <div>
                <div class="fw-semibold">
                    ${escapeHtml(
                        member.name ||
                        "Nexora Member"
                    )}
                </div>

                <div class="small text-muted">
                    ${escapeHtml(
                        member.email || ""
                    )}
                </div>
            </div>
        `;


        membersList.appendChild(element);
    });
}


/*
 * UPDATE LEAVE BUTTON
 */
function updateMembershipButtons(group) {
    const userId = getCurrentUserId();


    if (!userId) {
        leaveGroupBtn.disabled = true;

        return;
    }


    const creatorId =
        group.creator?._id ||
        group.creator?.toString();


    const isCreator =
        creatorId === userId;


    const isMember =
        (group.members || []).some(
            (member) =>
                (member._id || member.toString()) ===
                userId
        );


    if (isCreator) {
        leaveGroupBtn.disabled = true;

        leaveGroupBtn.textContent =
            "Creator cannot leave group";

        return;
    }


    if (isMember) {
        leaveGroupBtn.disabled = false;

        leaveGroupBtn.textContent =
            "Leave Group";

    } else {
        leaveGroupBtn.disabled = true;

        leaveGroupBtn.textContent =
            "Join the group first";
    }
}


/*
 * LOAD GROUP CHAT HISTORY
 */
async function loadGroupMessages() {
    const token = getToken();
    const groupId = getGroupId();


    if (!token || !groupId) {
        return;
    }


    try {
        const response = await fetch(
            `${MESSAGE_API}/${groupId}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );


        const result =
            await response.json();


        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to load messages."
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


/*
 * RENDER MESSAGES
 */
function renderMessages(messages) {
    groupChatMessages.innerHTML = "";


    if (!messages || messages.length === 0) {
        groupChatMessages.innerHTML = `
            <div class="text-muted text-center py-5">
                No messages yet.
                Start the conversation!
            </div>
        `;

        return;
    }


    messages.forEach((message) => {
        appendMessage(message);
    });


    scrollChatToBottom();
}


/*
 * ADD ONE MESSAGE
 */
function appendMessage(message) {
    const currentUserId = getCurrentUserId();

    const senderId =
        message.sender?._id ||
        message.sender;

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

    messageElement.dataset.messageId =
        message._id;

    const senderName =
        isMine
            ? "You"
            : message.sender?.name ||
              "Nexora Member";

    const time =
        message.createdAt
            ? new Date(
                message.createdAt
            ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "";

    const messageText = message.deleted
        ? "This message was deleted for everyone."
        : message.text;

    const deletedClass =
        message.deleted
            ? "deleted-message"
            : "";

    messageElement.innerHTML = `
        <div
            class="group-message-wrapper ${
                isMine
                    ? "mine"
                    : "theirs"
            }"
        >

            <div class="group-message-row">

                <div
                    class="group-message-content p-3 rounded-3 ${
                        isMine
                            ? "bg-primary text-white"
                            : "bg-light"
                    } ${deletedClass}"
                >

                    <div class="small fw-semibold mb-1">
                        ${escapeHtml(senderName)}
                    </div>

                    <div class="group-message-text">
                        ${escapeHtml(messageText)}
                    </div>

                    <div
                        class="small mt-1 ${
                            isMine
                                ? "text-white-50"
                                : "text-muted"
                        }"
                    >
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

    groupChatMessages.appendChild(
        messageElement
    );
}

function showMessageMenu(messageElement, messageId) {
    // Pehle se koi menu open hai to remove karo
    document
        .querySelectorAll(".group-message-menu")
        .forEach((menu) => menu.remove());

    const deleteButton =
        messageElement.querySelector(
            ".group-delete-btn"
        );

    if (!deleteButton) return;

    const menu =
        document.createElement("div");

    menu.className =
        "group-message-menu";

    menu.innerHTML = `
        <button
            type="button"
            class="group-menu-delete"
        >
            🗑 Delete for everyone
        </button>
    `;

    // Message ke wrapper ko relative rakhenge
    const wrapper =
        messageElement.querySelector(
            ".group-message-wrapper"
        );

    wrapper.style.position = "relative";

    wrapper.appendChild(menu);

    const deleteOption =
        menu.querySelector(
            ".group-menu-delete"
        );

    deleteOption.addEventListener(
        "click",
        () => {
            menu.remove();

            deleteGroupMessage(
                messageId
            );
        }
    );

    // Bahar click karne par menu close
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
        document.getElementById("deleteConfirmModal");

    if (existingModal) {
        existingModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.id = "deleteConfirmModal";
    modal.className =
        "delete-confirm-overlay";

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

    /*
     * CANCEL
     */
    document
        .getElementById("cancelDeleteBtn")
        .addEventListener("click", () => {
            modal.remove();
        });

    /*
     * CONFIRM DELETE
     */
    document
        .getElementById("confirmDeleteBtn")
        .addEventListener("click", async () => {

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

                /*
                 * Modal close
                 */
                modal.remove();

                /*
                 * Update current message
                 */
                const messageElement =
                    groupChatMessages.querySelector(
                        `[data-message-id="${messageId}"]`
                    );

                if (messageElement) {

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
        });

    /*
     * CLICK OUTSIDE = CLOSE
     */
    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === modal
            ) {
                modal.remove();
            }
        }
    );
}


async function performGroupMessageDelete(messageId) {
    const token = getToken();
    const groupId = getGroupId();

    if (!token || !groupId) {
        return;
    }

    try {
        const response = await fetch(
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

        const messageElement =
            groupChatMessages.querySelector(
                `[data-message-id="${messageId}"]`
            );

        if (messageElement) {

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

            const bubble =
                messageElement.querySelector(
                    ".group-message-content"
                );

            if (bubble) {
                bubble.classList.add(
                    "deleted-message"
                );
            }
        }

        showStatus(
            "Message deleted for everyone.",
            "success"
        );

    } catch (error) {

        console.error(
            "Delete group message error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to delete message.",
            "danger"
        );
    }
}

/*
 * SEND MESSAGE
 */
function sendGroupMessage(event) {
    event.preventDefault();

    const text = groupChatInput.value.trim();

    if (!text) {
        return;
    }

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

    if (!groupSocket || !groupSocket.connected) {
        showStatus(
            "Group chat is not connected. Please refresh.",
            "danger"
        );
        return;
    }

    groupChatInput.disabled = true;

    groupSocket.emit(
        "send_group_message",
        {
            groupId,
            text,
        }
    );

    groupChatInput.value = "";
    groupChatInput.focus();

    groupChatInput.disabled = false;
}


/*
 * SCROLL CHAT
 */
function scrollChatToBottom() {
    groupChatMessages.scrollTop =
        groupChatMessages.scrollHeight;
}


/*
 * LEAVE GROUP
 */
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


    if (!groupId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to leave this study group?"
        );


    if (!confirmed) {
        return;
    }


    try {
        const response = await fetch(
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


        if (!response.ok || !result.success) {
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


/*
 * EVENT LISTENERS
 */
leaveGroupBtn.addEventListener(
    "click",
    leaveGroup
);


groupChatForm.addEventListener(
    "submit",
    sendGroupMessage
);


/*
 * INITIAL LOAD
 */

function setupGroupSocket() {
    if (typeof io !== "function") {
        console.warn("Socket.IO is not available.");
        return;
    }

    const token = getToken();

    if (!token) {
        console.warn("Authentication token not found.");
        return;
    }

    groupSocket = io({
        auth: {
            token: token,
        },
    });

    groupSocket.on("connect", () => {
        console.log("Group chat socket connected.");

        if (currentGroupId) {
            groupSocket.emit(
            "join_group",
            currentGroupId
        );
}
    });

    groupSocket.on("connect_error", (error) => {
        console.error(
            "Group socket connection error:",
            error.message
        );
    });

    groupSocket.on("group_joined", (data) => {
        console.log(
            "Joined group room:",
            data.groupId
        );
    });

    groupSocket.on(
        "group_chat_error",
        (data) => {
            showStatus(
                data.message ||
                    "Group chat error.",
                "danger"
            );
        }
    );

    // New group message
    groupSocket.on(
        "new_group_message",
        (message) => {
            if (!message) return;

            appendMessage(message);
        }
    );

    // Deleted group message
    groupSocket.on(
        "group_message_deleted",
        (data) => {
            if (!data?.messageId) return;

            const messageElement =
                groupChatMessages.querySelector(
                    `[data-message-id="${data.messageId}"]`
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

            const bubble =
                messageElement.querySelector(
                    ".group-message-wrapper > div"
                );

            if (bubble) {
                bubble.classList.add(
                    "deleted-message"
                );
            }
        }
    );
}
loadGroup();
setupGroupSocket();