document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const messageBox = document.getElementById("contactMessage");
    const submitButton = document.getElementById("contactSubmit");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !subject || !message) {
            showMessage("Please fill in all fields.", "danger");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to send your message."
                );
            }

            showMessage(
                "Your message has been sent successfully!",
                "success"
            );

            form.reset();

        } catch (error) {
            console.error("Contact form error:", error);

            showMessage(
                error.message || "Something went wrong. Please try again.",
                "danger"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
        }
    });

    function showMessage(message, type) {
        messageBox.innerHTML = `
            <div class="alert alert-${type}" role="alert">
                ${message}
            </div>
        `;

        setTimeout(() => {
            messageBox.innerHTML = "";
        }, 5000);
    }
});