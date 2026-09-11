const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const params =
    new URLSearchParams(window.location.search);

const resetToken =
    params.get("token");

resetPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const message =
            document.getElementById("msg");

        message.innerHTML = "";

        if (!resetToken) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    Invalid or missing reset token.
                </div>
            `;

            return;
        }

        const password =
            document.getElementById("password")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;

        if (password !== confirmPassword) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    Passwords do not match.
                </div>
            `;

            return;
        }

        try {

            const data = await api(
                `/auth/reset-password/${encodeURIComponent(resetToken)}`,
                {
                    method: "POST",

                    body: JSON.stringify({
                        password,
                        confirmPassword,
                    }),
                }
            );

            message.innerHTML = `
                <div class="alert alert-success">
                    ${escapeHtml(data.message)}
                </div>
            `;

            resetPasswordForm.reset();

            setTimeout(() => {
                window.location.href =
                    "/pages/login.html";
            }, 2000);

        } catch (error) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    ${escapeHtml(error.message)}
                </div>
            `;
        }
    }
);