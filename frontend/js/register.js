document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("msg");
    message.innerHTML = "";

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        message.innerHTML = `<div class="alert alert-danger">Passwords do not match.</div>`;
        return;
    }

    try {
        const data = await api("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                password,
                confirmPassword,
            }),
        });
        saveAuth(data);
        toast("Account created successfully!");
        window.location.href = "/pages/dashboard.html";
    } catch (error) {
        message.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
});
