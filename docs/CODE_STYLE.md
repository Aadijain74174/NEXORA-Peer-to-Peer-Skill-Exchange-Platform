# Nexora Code Style

The goal of the Nexora codebase is to remain readable, maintainable and easy for every team member to understand.

## 1. General Rules

- Use readable indentation and spacing.
- Prefer descriptive variable and function names.
- Keep related logic together.
- Keep page-specific JavaScript outside HTML.
- Keep backend routes separated by feature.
- Explain non-obvious business rules in comments.
- Avoid unnecessary one-line compressed code.
- Avoid fake data and `coming soon` placeholders for core features.

## 2. HTML

Use semantic and readable HTML.

Prefer:

```html
<form id="contactForm">
    <div class="mb-3">
        <label for="email" class="form-label">
            Email Address
        </label>

        <input
            type="email"
            id="email"
            class="form-control"
            required
        >
    </div>
</form>
```

Avoid putting large JavaScript blocks directly inside HTML pages.

## 3. JavaScript

Use descriptive names:

```js
const contactForm = document.getElementById("contactForm");
const submitButton = document.getElementById("contactSubmit");
```

Prefer readable functions:

```js
async function loadNotifications() {
    try {
        // API work
    } catch (error) {
        console.error("Notification loading error:", error);
    }
}
```

Avoid compressed code such as:

```js
let sessions=[],cursor=new Date();
```

when the same logic can be written clearly over multiple lines.

## 4. API Requests

Use `try/catch` around API-driven UI operations.

Check the response before assuming success:

```js
const response = await fetch("/api/example");

const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Request failed.");
}
```

## 5. User Input

Validate input on the backend even if the frontend already validates it.

Escape user-generated content before inserting it into HTML.

Never trust browser-provided IDs, roles, permissions or sensitive values.

## 6. Backend Routes

Keep each feature in its own route file:

```text
auth.js
users.js
skills.js
matches.js
requests.js
sessions.js
reviews.js
messages.js
notifications.js
credits.js
reports.js
analytics.js
admin.js
contact.js
```

Avoid placing unrelated features in a single large route file.

## 7. Models

Mongoose models should describe database structure clearly.

Use meaningful field names and appropriate validation.

For example:

```js
status: {
    type: String,
    enum: ["new", "read", "replied"],
    default: "new",
}
```

## 8. Authentication and Security

- Keep JWT handling in authentication-related code.
- Keep authorization checks in middleware or protected routes.
- Never store plain-text passwords.
- Never commit `.env`.
- Never place Gmail passwords, API keys or database credentials in source files.
- Use Google App Passwords for Gmail SMTP instead of a normal Gmail password.

## 9. CSS

Use shared styles from:

```text
frontend/css/style.css
frontend/css/navbar.css
frontend/css/animations.css
```

Prefer classes over large inline styles.

Keep animations lightweight and respect:

```css
@media (prefers-reduced-motion: reduce) {
    /* Reduce motion for accessibility */
}
```

## 10. Naming

Use clear names.

Good:

```text
contactForm
messageBox
availabilitySlots
notificationCount
loadUserProfile()
renderAvailability()
```

Avoid unclear names:

```text
x
a1
tmp
doStuff()
```

unless a very short local variable is obvious from context.

## 11. Comments

Comments should explain **why** when the logic is not obvious.

Good:

```js
// Only create a valid availability slot when the ending time is
// later than the starting time.
```

Avoid comments that simply repeat the code.

## 12. Git

Before editing:

```bash
git pull origin main
```

After testing:

```bash
git status
git add .
git commit -m "Clear description of change"
git push
```

Use focused commits rather than one huge commit containing unrelated changes.

## 13. Team Principle

A new team member should be able to understand a feature by following:

```text
HTML
  ↓
JavaScript
  ↓
API Route
  ↓
Middleware
  ↓
Model
  ↓
MongoDB
```

Keep the project organized so future corrections can be made without searching through unrelated files.
