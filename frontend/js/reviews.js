requireAuth();

const me = getUser();
const eligible = document.getElementById("eligible");
const myReviews = document.getElementById("myReviews");

function stars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

async function loadReviews() {
    try {
        const sessionsResponse = await api("/sessions");
        const completed = sessionsResponse.sessions.filter((session) => session.status === "Completed");
        const pending = [];

        for (const session of completed) {
            const reviewResponse = await api(`/reviews/session/${session._id}`);
            if (reviewResponse.review) continue;

            const mine = String(session.teacher?._id) === String(me._id);
            const partner = mine ? session.learner : session.teacher;
            pending.push(`
                <article class="border rounded-4 p-3 mb-2">
                    <strong>${escapeHtml(session.skill)}</strong>
                    <div class="small text-secondary mt-1">${escapeHtml(session.date)} • ${escapeHtml(session.time)} • ${escapeHtml(partner?.name || "Partner")}</div>
                    <a class="btn btn-sm btn-primary mt-3" href="/pages/reviews.html?sessionId=${session._id}&userId=${partner?._id}">Rate partner</a>
                </article>`);
        }

        eligible.innerHTML = pending.join("") || `<div class="empty-state">No completed sessions are waiting for a review.</div>`;

        const reviewResponse = await api(`/reviews/${me._id}`);
        myReviews.innerHTML = reviewResponse.reviews.map((review) => `
            <article class="border rounded-4 p-3 mb-2"><div class="text-warning fs-5">${stars(review.rating)}</div><div class="mt-2">${escapeHtml(review.comment || "No written comment.")}</div><div class="small text-secondary mt-2">From ${escapeHtml(review.reviewer?.name || "User")} • ${new Date(review.createdAt).toLocaleDateString()}</div></article>`).join("") || `<div class="empty-state">No reviews yet. Complete an exchange to build your reputation.</div>`;

        const query = new URLSearchParams(window.location.search);
        if (query.get("sessionId") && query.get("userId")) showReviewForm(query.get("sessionId"), query.get("userId"));
    } catch (error) {
        toast(error.message, "danger");
    }
}

function showReviewForm(sessionId, userId) {
    if (document.getElementById("reviewForm")) return;

    eligible.insertAdjacentHTML("afterbegin", `
        <form id="reviewForm" class="border border-primary rounded-4 p-3 mb-3">
            <h5>Leave a review</h5>
            <label class="form-label mt-2">Rating</label>
            <select id="reviewRating" class="form-select">
                <option value="5">★★★★★ — Excellent</option>
                <option value="4">★★★★☆ — Very good</option>
                <option value="3">★★★☆☆ — Good</option>
                <option value="2">★★☆☆☆ — Fair</option>
                <option value="1">★☆☆☆☆ — Poor</option>
            </select>
            <label class="form-label mt-3">Comment</label>
            <textarea id="reviewComment" class="form-control" maxlength="1000" rows="3" placeholder="What was the exchange experience like?"></textarea>
            <button class="btn btn-primary mt-3">Submit review</button>
        </form>`);

    document.getElementById("reviewForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
            await api("/reviews", {
                method: "POST",
                body: JSON.stringify({
                    reviewedUser: userId,
                    session: sessionId,
                    rating: Number(document.getElementById("reviewRating").value),
                    comment: document.getElementById("reviewComment").value.trim(),
                }),
            });
            toast("Review submitted!");
            window.history.replaceState({}, "", "/pages/reviews.html");
            await loadReviews();
        } catch (error) {
            toast(error.message, "danger");
        }
    });
}

loadReviews();
