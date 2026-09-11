const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const message =
            document.getElementById("msg");

        message.innerHTML = "";

        const email =
            document.getElementById("email")
                .value
                .trim();

        try {
            const data = await api(
                "/auth/forgot-password",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                    }),
                }
            );

            message.innerHTML = `
                <div class="alert alert-success">
                    ${escapeHtml(data.message)}
                </div>
            `;

            // Local testing link.
            if (data.devResetLink) {
                message.innerHTML += `
                    <div class="alert alert-info mt-2">
                        <strong>Testing Reset Link:</strong>
                        <br>
                        <a
                            href="${escapeHtml(data.devResetLink)}"
                        >
                            Open Reset Password
                        </a>
                    </div>
                `;
            }

        } catch (error) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    ${escapeHtml(error.message)}
                </div>
            `;
        }
    }
);