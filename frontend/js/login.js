document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("msg");
    message.innerHTML = "";

    try {
        const data = await api("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: document.getElementById("email").value.trim(),
                password: document.getElementById("password").value,
            }),
        });
        saveAuth(data);
        window.location.href = "/pages/dashboard.html";
    } catch (error) {
        message.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
});
