const API_BASE = "/api/study-groups";

const groupsContainer = document.getElementById("groupsContainer");
const groupStatus = document.getElementById("groupStatus");

const groupSearch = document.getElementById("groupSearch");
const searchGroupBtn = document.getElementById("searchGroupBtn");

const allGroupsBtn = document.getElementById("allGroupsBtn");
const myGroupsBtn = document.getElementById("myGroupsBtn");

const createGroupForm = document.getElementById("createGroupForm");


function getToken() {
    return localStorage.getItem("token");
}


function showStatus(message, type = "info") {
    groupStatus.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${message}
        </div>
    `;
}


function clearStatus() {
    groupStatus.innerHTML = "";
}


function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value || "";
    return div.innerHTML;
}


async function loadGroups() {
    try {
        clearStatus();

        groupsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border" role="status"></div>
                <p class="text-muted mt-3">
                    Loading study groups...
                </p>
            </div>
        `;

        const response = await fetch(API_BASE);

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load study groups."
            );
        }

        renderGroups(result.data);

    } catch (error) {
        console.error("Load study groups error:", error);

        groupsContainer.innerHTML = "";

        showStatus(
            error.message || "Unable to load study groups.",
            "danger"
        );
    }
}


async function loadMyGroups() {
    const token = getToken();

    if (!token) {
        showStatus(
            "Please login to view your study groups.",
            "warning"
        );

        groupsContainer.innerHTML = "";

        return;
    }

    try {
        clearStatus();

        groupsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border" role="status"></div>
                <p class="text-muted mt-3">
                    Loading your groups...
                </p>
            </div>
        `;

        const response = await fetch(`${API_BASE}/my`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load your groups."
            );
        }

        renderGroups(result.data);

    } catch (error) {
        console.error("Load my groups error:", error);

        groupsContainer.innerHTML = "";

        showStatus(
            error.message || "Unable to load your groups.",
            "danger"
        );
    }
}


async function searchGroups() {
    const query = groupSearch.value.trim();

    if (!query) {
        loadGroups();
        return;
    }

    try {
        clearStatus();

        groupsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border" role="status"></div>
                <p class="text-muted mt-3">
                    Searching...
                </p>
            </div>
        `;

        const response = await fetch(
            `${API_BASE}/search?q=${encodeURIComponent(query)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Search failed."
            );
        }

        renderGroups(result.data);

    } catch (error) {
        console.error("Search study groups error:", error);

        groupsContainer.innerHTML = "";

        showStatus(
            error.message || "Unable to search groups.",
            "danger"
        );
    }
}


function renderGroups(groups) {
    groupsContainer.innerHTML = "";

    if (!groups || groups.length === 0) {
        groupsContainer.innerHTML = `
            <div class="col-12">
                <div class="card-soft text-center py-5">

                    <div style="font-size: 48px;">
                        📚
                    </div>

                    <h4 class="fw-bold mt-3">
                        No Study Groups Found
                    </h4>

                    <p class="text-muted mb-0">
                        Create a study group and start learning together.
                    </p>

                </div>
            </div>
        `;

        return;
    }

    groups.forEach((group) => {
        const memberCount = group.members
            ? group.members.length
            : 0;

        const creatorName =
            group.creator?.name || "Nexora Member";

        const card = document.createElement("div");

        card.className = "col-md-6 col-lg-4";

        card.innerHTML = `
            <div class="card-soft h-100 d-flex flex-column">

                <div class="d-flex justify-content-between align-items-start mb-3">

                    <span class="badge text-bg-primary">
                        ${escapeHtml(group.level)}
                    </span>

                    <span class="badge text-bg-light">
                        👥 ${memberCount}/${group.maxMembers}
                    </span>

                </div>


                <h4 class="fw-bold mb-2">
                    ${escapeHtml(group.name)}
                </h4>


                <p class="mb-2">
                    <strong>Skill:</strong>
                    ${escapeHtml(group.skill)}
                </p>


                <p class="text-muted small flex-grow-1">
                    ${escapeHtml(
                        group.description ||
                        "No description provided."
                    )}
                </p>


                <div class="small text-muted mb-3">
                    Created by
                    <strong>
                        ${escapeHtml(creatorName)}
                    </strong>
                </div>


                <div class="d-flex gap-2">

                    <button
                        class="btn btn-outline-primary flex-grow-1"
                        onclick="viewGroup('${group._id}')"
                    >
                        View Group
                    </button>

                    <button
                        class="btn btn-primary"
                        onclick="joinGroup('${group._id}')"
                    >
                        Join
                    </button>

                </div>

            </div>
        `;

        groupsContainer.appendChild(card);
    });
}


async function createGroup(event) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
        showStatus(
            "Please login before creating a study group.",
            "warning"
        );

        return;
    }

    const name = document
        .getElementById("groupName")
        .value
        .trim();

    const skill = document
        .getElementById("groupSkill")
        .value
        .trim();

    const description = document
        .getElementById("groupDescription")
        .value
        .trim();

    const level = document
        .getElementById("groupLevel")
        .value;

    const maxMembers = Number(
        document.getElementById("maxMembers").value
    );


    try {
        const response = await fetch(API_BASE, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
                name,
                skill,
                description,
                level,
                maxMembers,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to create group."
            );
        }


        createGroupForm.reset();

        document.getElementById("maxMembers").value = 15;


        const modalElement =
            document.getElementById("createGroupModal");

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }


        showStatus(
            "Study group created successfully!",
            "success"
        );

        loadGroups();

    } catch (error) {
        console.error("Create study group error:", error);

        showStatus(
            error.message || "Unable to create study group.",
            "danger"
        );
    }
}


async function joinGroup(groupId) {
    const token = getToken();

    if (!token) {
        showStatus(
            "Please login to join a study group.",
            "warning"
        );

        return;
    }


    try {
        const response = await fetch(
            `${API_BASE}/${groupId}/join`,
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );


        const result = await response.json();


        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to join group."
            );
        }


        showStatus(
            "You joined the study group successfully!",
            "success"
        );

        loadGroups();

    } catch (error) {
        console.error("Join study group error:", error);

        showStatus(
            error.message || "Unable to join group.",
            "danger"
        );
    }
}


function viewGroup(groupId) {
    window.location.href =
        `/pages/study-group-room.html?id=${groupId}`;
}


searchGroupBtn.addEventListener(
    "click",
    searchGroups
);


groupSearch.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            searchGroups();
        }
    }
);


allGroupsBtn.addEventListener(
    "click",
    () => {
        allGroupsBtn.classList.add("btn-primary");
        allGroupsBtn.classList.remove("btn-outline-primary");

        myGroupsBtn.classList.remove("btn-primary");
        myGroupsBtn.classList.add("btn-outline-primary");

        loadGroups();
    }
);


myGroupsBtn.addEventListener(
    "click",
    () => {
        myGroupsBtn.classList.add("btn-primary");
        myGroupsBtn.classList.remove("btn-outline-primary");

        allGroupsBtn.classList.remove("btn-primary");
        allGroupsBtn.classList.add("btn-outline-primary");

        loadMyGroups();
    }
);


createGroupForm.addEventListener(
    "submit",
    createGroup
);


loadGroups();