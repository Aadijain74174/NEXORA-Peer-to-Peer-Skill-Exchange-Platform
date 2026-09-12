requireAuth();

const me = getUser();

let socket = window.nexoraSocket;
let currentPartnerId = null;

const partnerSelect =
    document.getElementById("partner");

const partnerInfo =
    document.getElementById("partnerInfo");

const messagesContainer =
    document.getElementById("messages");

const form =
    document.getElementById("form");

const textInput =
    document.getElementById("text");

const status =
    document.getElementById("status");


/* =========================================
   ADD MESSAGE
   ========================================= */

function addMessage(message) {

    const senderId =
        message.sender?._id ||
        message.sender;

    const mine =
        String(senderId) === String(me._id);


    const wrapper =
        document.createElement("div");

    wrapper.className =
        `mb-3 ${mine ? "text-end" : ""}`;

    wrapper.dataset.messageId =
        message._id;


    const bubbleRow =
        document.createElement("div");

    bubbleRow.className =
        `d-flex align-items-center gap-2 ${
            mine
                ? "justify-content-end"
                : "justify-content-start"
        }`;


    /* =====================================
       MESSAGE BUBBLE
       ===================================== */

    const bubble =
        document.createElement("div");

    bubble.className =
        `chat-bubble ${
            mine
                ? "mine"
                : "theirs"
        }`;


    if (message.deleted) {

        bubble.classList.add(
            "deleted-message"
        );

        bubble.textContent =
            "This message was deleted.";

    } else {

        bubble.textContent =
            message.text;
    }


    bubbleRow.appendChild(bubble);


    /* =====================================
       DELETE BUTTON
       Sirf apne non-deleted message par
       ===================================== */

    if (
        mine &&
        !message.deleted
    ) {

        const deleteButton =
            document.createElement("button");


        deleteButton.type =
            "button";

        deleteButton.className =
            "btn btn-sm btn-link text-danger p-0 chat-delete-btn";

        deleteButton.textContent =
            "⋮";

        deleteButton.title =
            "Message options";

        deleteButton.setAttribute(
            "aria-label",
            "Message options"
        );


        deleteButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                showMessageMenu(
                    wrapper,
                    message._id
                );
            }
        );


        bubbleRow.appendChild(
            deleteButton
        );
    }


    /* =====================================
       MESSAGE TIME
       ===================================== */

    const time =
        document.createElement("div");

    time.className =
        "small text-secondary mt-1";


    time.textContent =
        message.createdAt
            ? new Date(
                message.createdAt
            ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "";


    wrapper.appendChild(
        bubbleRow
    );

    wrapper.appendChild(
        time
    );


    messagesContainer.appendChild(
        wrapper
    );


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


/* =========================================
   MESSAGE MENU
   ⋮ → Delete for everyone
   ========================================= */

function showMessageMenu(
    messageElement,
    messageId
) {

    /* Existing menus close karo */

    document
        .querySelectorAll(
            ".chat-message-menu"
        )
        .forEach((menu) => {
            menu.remove();
        });


    const deleteButton =
        messageElement.querySelector(
            ".chat-delete-btn"
        );


    if (!deleteButton) {
        return;
    }


    const menu =
        document.createElement("div");

    menu.className =
        "chat-message-menu";


    menu.innerHTML = `
        <button
            type="button"
            class="chat-menu-delete"
        >
            🗑 Delete for everyone
        </button>
    `;


    /*
     * Message wrapper ko relative
     * banayenge taaki menu wahi ke paas aaye
     */

    messageElement.style.position =
        "relative";


    messageElement.appendChild(
        menu
    );


    const deleteOption =
        menu.querySelector(
            ".chat-menu-delete"
        );


    deleteOption.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            menu.remove();

            showDeleteConfirmation(
                messageId
            );
        }
    );


    /*
     * Bahar click hone par menu close
     */

    setTimeout(() => {

        document.addEventListener(
            "click",
            function closeMenu(event) {

                if (
                    !menu.contains(
                        event.target
                    ) &&
                    event.target !==
                        deleteButton
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


/* =========================================
   DELETE CONFIRMATION MODAL
   ========================================= */

function showDeleteConfirmation(
    messageId
) {

    /*
     * Agar pehle se modal hai
     * to remove karo
     */

    const existingModal =
        document.getElementById(
            "deleteConfirmModal"
        );


    if (existingModal) {
        existingModal.remove();
    }


    const modal =
        document.createElement("div");


    modal.id =
        "deleteConfirmModal";

    modal.className =
        "delete-confirm-overlay";


    modal.innerHTML = `
        <div class="delete-confirm-box">

            <div class="delete-confirm-icon">
                🗑️
            </div>

            <h5>
                Delete message?
            </h5>

            <p>
                This message will be deleted
                for everyone in this chat.
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


    document.body.appendChild(
        modal
    );


    /* =====================================
       CANCEL
       ===================================== */

    const cancelButton =
        document.getElementById(
            "cancelDeleteBtn"
        );


    cancelButton.addEventListener(
        "click",
        () => {

            modal.remove();
        }
    );


    /* =====================================
       CONFIRM DELETE
       ===================================== */

    const confirmButton =
        document.getElementById(
            "confirmDeleteBtn"
        );


    confirmButton.addEventListener(
        "click",
        () => {

            /*
             * Double click prevent
             */

            confirmButton.disabled =
                true;

            confirmButton.textContent =
                "Deleting...";


            performMessageDelete(
                messageId
            );

            modal.remove();
        }
    );


    /* =====================================
       CLICK OUTSIDE MODAL
       ===================================== */

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


    /* =====================================
       ESC KEY
       ===================================== */

    const escapeHandler =
        (event) => {

            if (
                event.key === "Escape"
            ) {

                modal.remove();

                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );
            }
        };


    document.addEventListener(
        "keydown",
        escapeHandler
    );
}


/* =========================================
   DELETE MESSAGE
   ========================================= */

function deleteMessage(
    messageId
) {

    showDeleteConfirmation(
        messageId
    );
}


/* =========================================
   PERFORM SOCKET DELETE
   ========================================= */

function performMessageDelete(
    messageId
) {

    if (
        !socket ||
        !socket.connected
    ) {

        toast(
            "Chat is not connected. Refresh and try again.",
            "danger"
        );

        return;
    }


    socket.emit(
        "delete_message",
        {
            messageId,
        }
    );
}


/* =========================================
   LOAD PARTNERS
   ========================================= */

async function loadPartners() {

    try {

        const data =
            await api("/users");


        partnerSelect.innerHTML =
            `
            <option value="">
                Select a partner...
            </option>
            ` +
            data.users
                .map(
                    (user) =>
                        `
                        <option value="${user._id}">
                            ${escapeHtml(user.name)}
                            —
                            ${escapeHtml(user.email)}
                        </option>
                        `
                )
                .join("");


        const requestedUser =
            new URLSearchParams(
                window.location.search
            ).get("userId");


        if (
            requestedUser &&
            data.users.some(
                (user) =>
                    user._id ===
                    requestedUser
            )
        ) {

            partnerSelect.value =
                requestedUser;

            await openChat(
                requestedUser
            );
        }

    } catch (error) {

        toast(
            error.message,
            "danger"
        );
    }
}


/* =========================================
   OPEN CHAT
   ========================================= */

async function openChat(
    userId
) {

    if (!userId) {
        return;
    }


    currentPartnerId =
        userId;


    messagesContainer.innerHTML =
        `
        <div class="loading-state">
            Loading conversation...
        </div>
        `;


    try {

        const data =
            await api(
                `/messages/with/${userId}`
            );


        partnerInfo.textContent =
            `Chatting with ${data.partner.name}`;


        messagesContainer.innerHTML =
            "";


        data.messages.forEach(
            addMessage
        );


        await api(
            `/messages/with/${userId}/read`,
            {
                method: "PUT",
            }
        );


        refreshNotificationCount();


        if (socket) {

            socket.emit(
                "join_chat",
                userId
            );
        }

    } catch (error) {

        messagesContainer.innerHTML =
            `
            <div class="alert alert-danger m-3">
                ${escapeHtml(
                    error.message
                )}
            </div>
            `;
    }
}


/* =========================================
   PARTNER CHANGE
   ========================================= */

partnerSelect.addEventListener(
    "change",
    () => {

        openChat(
            partnerSelect.value
        );
    }
);


/* =========================================
   SEND MESSAGE
   ========================================= */

form.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        if (!currentPartnerId) {

            return toast(
                "Please choose a partner.",
                "warning"
            );
        }


        const message =
            textInput.value.trim();


        if (!message) {
            return;
        }


        if (
            !socket ||
            !socket.connected
        ) {

            return toast(
                "Chat is not connected. Refresh and try again.",
                "danger"
            );
        }


        socket.emit(
            "send_message",
            {
                receiver:
                    currentPartnerId,

                text:
                    message,
            }
        );


        textInput.value =
            "";

        textInput.focus();
    }
);


/* =========================================
   SETUP SOCKET
   ========================================= */

function setupSocket() {

    /*
     * Existing global socket use karo
     */

    if (
        !socket &&
        typeof io === "function"
    ) {

        socket =
            io({
                auth: {
                    token:
                        getToken(),
                },
            });


        window.nexoraSocket =
            socket;
    }


    if (!socket) {

        status.textContent =
            "Chat unavailable";

        return;
    }


    /* =====================================
       CONNECT
       ===================================== */

    socket.on(
        "connect",
        () => {

            status.textContent =
                "● Connected — messages update instantly";


            /*
             * Agar chat already selected hai
             * to room dobara join karo
             */

            if (currentPartnerId) {

                socket.emit(
                    "join_chat",
                    currentPartnerId
                );
            }
        }
    );


    /* =====================================
       CONNECTION ERROR
       ===================================== */

    socket.on(
        "connect_error",
        () => {

            status.textContent =
                "Chat connection failed. Please refresh.";
        }
    );


    /* =====================================
       NEW MESSAGE
       ===================================== */

    socket.on(
        "new_message",
        (message) => {

            if (
                String(
                    message.sender?._id
                ) ===
                String(
                    currentPartnerId
                )
            ) {

                addMessage(
                    message
                );


                api(
                    `/messages/with/${currentPartnerId}/read`,
                    {
                        method: "PUT",
                    }
                ).catch(() => {});
            }
        }
    );


    /* =====================================
       MESSAGE SENT
       ===================================== */

    socket.on(
        "message_sent",
        (message) => {

            if (
                String(
                    message.receiver?._id
                ) ===
                String(
                    currentPartnerId
                )
            ) {

                addMessage(
                    message
                );
            }
        }
    );


    /* =====================================
       MESSAGE DELETED
       Ye event sender + receiver
       dono ko server se milega
       ===================================== */

    socket.on(
        "message_deleted",
        (data) => {

            if (
                !data ||
                !data.messageId
            ) {

                return;
            }


            const messageId =
                String(
                    data.messageId
                );


            const messageElements =
                messagesContainer.querySelectorAll(
                    "[data-message-id]"
                );


            messageElements.forEach(
                (element) => {

                    if (
                        String(
                            element.dataset
                                .messageId
                        ) !== messageId
                    ) {

                        return;
                    }


                    /* =====================
                       Bubble update
                       ===================== */

                    const bubble =
                        element.querySelector(
                            ".chat-bubble"
                        );


                    if (bubble) {

                        bubble.textContent =
                            "This message was deleted.";

                        bubble.classList.add(
                            "deleted-message"
                        );
                    }


                    /* =====================
                       Delete button remove
                       ===================== */

                    const deleteButton =
                        element.querySelector(
                            ".chat-delete-btn"
                        );


                    if (deleteButton) {

                        deleteButton.remove();
                    }
                }
            );
        }
    );


    /* =====================================
       DELETE SUCCESS
       Server confirm karega
       ===================================== */

    socket.on(
        "message_delete_success",
        (data) => {

            toast(
                "Message deleted for everyone.",
                "success"
            );
        }
    );


    /* =====================================
       CHAT ERROR
       ===================================== */

    socket.on(
        "chat_error",
        (data) => {

            toast(
                data?.message ||
                    "Chat error.",
                "danger"
            );
        }
    );
}


/* =========================================
   INITIALIZE
   ========================================= */

setupSocket();

loadPartners();