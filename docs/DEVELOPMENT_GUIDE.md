# Nexora Development Guide

This guide is a quick map for anyone working on the Nexora — Peer-to-Peer Skill Exchange Platform.
Use it to find **exactly where to make a change** before editing the code.

> **Project root:** `NEXORA-Peer-to-Peer-Skill-Exchange-Platform/`

> Do not create another `NEXORA` folder inside the project. The root should directly contain `backend`, `frontend`, and `docs`.

## 1. Project Structure

```text
# NEXORA — Development Guide

## 1. Project Structure

Nexora-Peer-to-Peer-Skill-Exchange/
│
├── backend/                              # Server-side / backend code
│   │
│   ├── config/
│   │   └── db.js                         # MongoDB database connection
│   │
│   ├── middleware/
│   │   ├── auth.js                       # JWT authentication
│   │   └── admin.js                      # Admin authorization
│   │
│   ├── models/                           # MongoDB / Mongoose models
│   │   ├── User.js                       # User profile and account data
│   │   ├── Skill.js                      # Skill information
│   │   ├── ExchangeRequest.js             # Skill exchange requests
│   │   ├── Session.js                    # Scheduled learning sessions
│   │   ├── Review.js                     # Ratings and reviews
│   │   ├── Message.js                    # Chat messages
│   │   ├── Notification.js               # User notifications
│   │   ├── CreditTransaction.js           # Skill credit transactions
│   │   ├── Report.js                     # User/content reports
│   │   ├── ContactMessage.js              # Contact Us messages
│   │   └── PasswordResetToken.js          # Password reset tokens
│   │
│   ├── routes/                           # REST API endpoints
│   │   ├── auth.js                       # Register, login, forgot/reset password
│   │   ├── users.js                      # User profile, goals and user data
│   │   ├── skills.js                     # Skill management
│   │   ├── matches.js                    # Smart skill matching
│   │   ├── requests.js                   # Exchange request management
│   │   ├── sessions.js                   # Session scheduling and joining
│   │   ├── reviews.js                    # Ratings and reviews
│   │   ├── messages.js                   # Chat message APIs
│   │   ├── notifications.js              # Notification APIs
│   │   ├── credits.js                    # Skill credit APIs
│   │   ├── reports.js                    # Reports and moderation
│   │   ├── analytics.js                  # User/project analytics
│   │   ├── admin.js                      # Admin operations
│   │   └── contact.js                    # Contact Us form API
│   │
│   ├── services/
│   │   └── mailer.js                     # Gmail/Nodemailer email service
│   │
│   └── server.js                         # Express + Socket.IO entry point
│
├── frontend/                             # Client-side / frontend code
│   │
│   ├── assets/
│   │   └── nexora-logo.png               # Nexora brand logo
│   │
│   ├── css/
│   │   ├── style.css                    # Global UI and design system
│   │   ├── navbar.css                   # Professional navbar styling
│   │   └── animations.css               # UI animations and transitions
│   │
│   ├── js/                               # Page-specific JavaScript
│   │   ├── main.js                      # Navbar, auth and common functions
│   │   ├── login.js                     # Login functionality
│   │   ├── register.js                  # Registration functionality
│   │   ├── dashboard.js                 # Dashboard functionality
│   │   ├── profile.js                   # Profile and availability
│   │   ├── skills.js                    # My Skills functionality
│   │   ├── find-skills.js               # Explore / Find Skills
│   │   ├── matches.js                   # Smart matching
│   │   ├── requests.js                  # Exchange requests
│   │   ├── sessions.js                  # Session management
│   │   ├── session-room.js              # Individual session room
│   │   ├── calendar.js                  # Calendar and session schedule
│   │   ├── chat.js                      # Real-time chat
│   │   ├── notifications.js             # Notifications
│   │   ├── reviews.js                   # Ratings and reviews
│   │   ├── credits.js                   # Skill credits
│   │   ├── analytics.js                 # Analytics
│   │   ├── view-profile.js              # Public user profile
│   │   ├── admin.js                     # Admin dashboard
│   │   ├── contact.js                   # Contact Us form
│   │   ├── forgot-password.js           # Forgot password
│   │   └── reset-password.js            # Reset password
│   │
│   ├── pages/                            # HTML pages / screens
│   │   ├── login.html                   # Login page
│   │   ├── register.html                # Registration page
│   │   ├── dashboard.html               # Main dashboard
│   │   ├── profile.html                 # User profile
│   │   ├── skills.html                  # My Skills
│   │   ├── find-skills.html             # Explore Skills
│   │   ├── matches.html                 # Skill matches
│   │   ├── requests.html                # Exchange requests
│   │   ├── sessions.html                # Sessions
│   │   ├── session-room.html            # Session room
│   │   ├── calendar.html                # Calendar
│   │   ├── chat.html                    # Real-time chat
│   │   ├── notifications.html           # Notifications
│   │   ├── reviews.html                 # Reviews
│   │   ├── credits.html                 # Skill credits
│   │   ├── analytics.html               # Analytics
│   │   ├── view-profile.html            # View another user
│   │   ├── admin.html                   # Admin dashboard
│   │   ├── contact.html                 # Contact Us
│   │   ├── about.html                   # About Nexora
│   │   ├── forgot-password.html         # Forgot password
│   │   └── reset-password.html           # Reset password
│   │
│   └── index.html                        # Public landing page
│
├── docs/                                 # Project documentation
│   ├── DEVELOPMENT_GUIDE.md              # Development instructions
│   ├── PROJECT_STRUCTURE.md              # Complete folder structure
│   ├── API_OVERVIEW.md                   # API endpoint documentation
│   └── CODE_STYLE.md                     # Coding standards
│
├── .env.example                          # Safe environment template
├── .gitignore                            # Ignores .env and node_modules
├── .editorconfig                         # Editor formatting rules
├── package.json                          # Dependencies and npm scripts
├── package-lock.json                     # Exact dependency versions
├── README.md                             # Project overview
├── START_HERE.md                         # Quick setup guide
└── FINAL_SETUP.md                        # Final configuration guide
```

### Architecture Flow

```text
User
  ↓
Frontend HTML
  ↓
Page JavaScript
  ↓
main.js / API helper
  ↓
Express routes
  ↓
Auth/Admin middleware where required
  ↓
Mongoose models
  ↓
MongoDB

Real-time Chat / Notifications
  Frontend ↔ Socket.IO ↔ backend/server.js
```

## 2. Authentication

| What you want to change | File |
|---|---|
| Login UI | `frontend/pages/login.html` |
| Login behavior | `frontend/js/login.js` |
| Registration UI | `frontend/pages/register.html` |
| Registration behavior | `frontend/js/register.js` |
| Login/register/password-reset API | `backend/routes/auth.js` |
| Password hashing | `backend/routes/auth.js` |
| JWT creation | `backend/routes/auth.js` |
| JWT validation | `backend/middleware/auth.js` |
| User fields | `backend/models/User.js` |

### Forgot / Reset Password

```text
frontend/pages/forgot-password.html
frontend/js/forgot-password.js

frontend/pages/reset-password.html
frontend/js/reset-password.js

backend/routes/auth.js
backend/models/PasswordResetToken.js
backend/services/mailer.js
```

## 3. Dashboard

```text
frontend/pages/dashboard.html
frontend/js/dashboard.js
backend/routes/users.js
backend/routes/sessions.js
backend/routes/requests.js
backend/routes/matches.js
backend/routes/notifications.js
frontend/css/style.css
```

## 4. Navbar / Global UI

```text
frontend/js/main.js
frontend/css/style.css
frontend/css/navbar.css
frontend/css/animations.css
```

`main.js` controls shared navigation, authentication helpers, API helpers and common UI behavior.

`navbar.css` controls the professional navbar.

`animations.css` contains lightweight page, card, button, form and alert animations while respecting reduced-motion accessibility preferences.

## 5. About Us

```text
frontend/pages/about.html
frontend/js/main.js
frontend/css/style.css
```

The About Us page is a public informational page explaining Nexora's purpose and mission.

## 6. Contact Us

```text
frontend/pages/contact.html
frontend/js/contact.js
backend/routes/contact.js
backend/models/ContactMessage.js
```

Contact messages are validated and stored in MongoDB.

If email handling is changed:

```text
backend/services/mailer.js
```

## 7. Profile

```text
frontend/pages/profile.html
frontend/js/profile.js
backend/routes/users.js
backend/models/User.js
```

Use these files for profile information, bio, education, experience, availability, learning goals, skills and achievements.

## 8. Skills

```text
frontend/pages/skills.html
frontend/js/skills.js
frontend/pages/profile.html
frontend/js/profile.js
backend/routes/skills.js
backend/routes/users.js
backend/models/Skill.js
backend/models/User.js
```

## 9. Find Skills / Explore Skills

```text
frontend/pages/find-skills.html
frontend/js/find-skills.js
backend/routes/users.js
```

Explore Skills is designed to support public discovery. Actions requiring an authenticated account can require login.

## 10. Smart Matches

```text
frontend/pages/matches.html
frontend/js/matches.js
backend/routes/matches.js
backend/models/User.js
```

The backend generates the matching score/reasons; the page displays the returned result.

## 11. Requests

```text
frontend/pages/requests.html
frontend/js/requests.js
backend/routes/requests.js
backend/models/ExchangeRequest.js
```

## 12. Sessions / Schedule / Join Session

```text
frontend/pages/sessions.html
frontend/js/sessions.js
frontend/pages/session-room.html
frontend/js/session-room.js
backend/routes/sessions.js
backend/models/Session.js
```

Meeting-link, completion and credits logic belongs primarily in `backend/routes/sessions.js`.

## 13. Calendar

```text
frontend/pages/calendar.html
frontend/js/calendar.js
backend/routes/sessions.js
```

## 14. Chat

```text
frontend/pages/chat.html
frontend/js/chat.js
backend/routes/messages.js
backend/models/Message.js
backend/server.js
```

REST endpoints manage history/read state while Socket.IO provides real-time communication.

## 15. Notifications

```text
frontend/pages/notifications.html
frontend/js/notifications.js
frontend/js/main.js
backend/routes/notifications.js
backend/models/Notification.js
backend/server.js
```

## 16. Reviews / Ratings

```text
frontend/pages/reviews.html
frontend/js/reviews.js
frontend/js/sessions.js
backend/routes/reviews.js
backend/models/Review.js
```

## 17. Skill Credits

```text
frontend/pages/credits.html
frontend/js/credits.js
backend/routes/credits.js
backend/routes/sessions.js
backend/models/CreditTransaction.js
backend/models/User.js
```

## 18. Trust Score

Trust-related information is based on user activity such as completed sessions and ratings.

Start with:

```text
backend/models/User.js
backend/routes/users.js
backend/routes/reviews.js
backend/routes/sessions.js
```

## 19. Analytics

```text
frontend/pages/analytics.html
frontend/js/analytics.js
backend/routes/analytics.js
```

## 20. Public Profile / Report User

```text
frontend/pages/view-profile.html
frontend/js/view-profile.js
backend/routes/users.js
backend/routes/reports.js
backend/models/Report.js
```

## 21. Admin Dashboard

```text
frontend/pages/admin.html
frontend/js/admin.js
backend/routes/admin.js
backend/middleware/admin.js
backend/models/User.js
backend/models/Report.js
```

## 22. Frontend Page → JavaScript Map

| Page | Main JavaScript |
|---|---|
| `index.html` | `main.js` |
| `about.html` | `main.js` |
| `login.html` | `login.js` |
| `register.html` | `register.js` |
| `forgot-password.html` | `forgot-password.js` |
| `reset-password.html` | `reset-password.js` |
| `contact.html` | `contact.js` |
| `dashboard.html` | `dashboard.js` |
| `profile.html` | `profile.js` |
| `skills.html` | `skills.js` |
| `find-skills.html` | `find-skills.js` |
| `matches.html` | `matches.js` |
| `requests.html` | `requests.js` |
| `sessions.html` | `sessions.js` |
| `session-room.html` | `session-room.js` |
| `calendar.html` | `calendar.js` |
| `chat.html` | `chat.js` |
| `notifications.html` | `notifications.js` |
| `reviews.html` | `reviews.js` |
| `credits.html` | `credits.js` |
| `analytics.html` | `analytics.js` |
| `view-profile.html` | `view-profile.js` |
| `admin.html` | `admin.js` |

Most pages also load `main.js` for shared navigation and common helpers.

## 23. Backend Route Map

| API area | Route file | Main purpose |
|---|---|---|
| Auth | `backend/routes/auth.js` | Register, login, current user, password reset |
| Users | `backend/routes/users.js` | Profile, goals, availability, achievements |
| Skills | `backend/routes/skills.js` | Skill API |
| Matches | `backend/routes/matches.js` | Smart matching |
| Requests | `backend/routes/requests.js` | Exchange requests |
| Sessions | `backend/routes/sessions.js` | Scheduling/completion/cancellation |
| Reviews | `backend/routes/reviews.js` | Ratings/reviews |
| Messages | `backend/routes/messages.js` | Chat history/read status |
| Notifications | `backend/routes/notifications.js` | Notification data/read state |
| Credits | `backend/routes/credits.js` | Credit balance/history |
| Reports | `backend/routes/reports.js` | User reports |
| Analytics | `backend/routes/analytics.js` | Learning/session analytics |
| Admin | `backend/routes/admin.js` | Moderation/admin operations |
| Contact | `backend/routes/contact.js` | Contact form submissions |

## 24. Design

Global design:

```text
frontend/css/style.css
```

Professional navbar:

```text
frontend/css/navbar.css
```

UI animations:

```text
frontend/css/animations.css
```

Logo:

```text
frontend/assets/nexora-logo.png
```

Prefer page-specific classes over large inline style blocks.

## 25. Environment Variables

Local `.env` is private and must not be committed.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/peer_skill_exchange
JWT_SECRET=your_secret_here
ADMIN_EMAIL=admin@example.com
```

If mailer support is enabled:

```env
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-google-app-password
```

Never put real secrets or private credentials in GitHub.

## 26. Safe Team Workflow

Before editing:

```bash
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/profile-improvements
```

After testing:

```bash
git add .
git commit -m "Improve profile page"
git push -u origin feature/profile-improvements
```

Then open a Pull Request on GitHub.

Avoid directly changing `main` for large features.

## 27. Before Editing a Feature

Follow:

```text
1. Find the page in frontend/pages/
        ↓
2. Open the matching frontend/js/ file
        ↓
3. If data/API is involved, open backend/routes/
        ↓
4. If database fields are involved, open backend/models/
        ↓
5. If authentication is involved, check middleware/auth.js
        ↓
6. If styling is involved, check frontend/css/
```

## 28. Readability Rules

- Keep HTML properly indented.
- Use descriptive variable and function names.
- Keep page-specific JavaScript outside HTML.
- Escape user-generated content before inserting it into HTML.
- Use `try/catch` around API-driven UI operations.
- Keep backend routes separated by feature.
- Keep business rules understandable through comments.
- Avoid fake data and `coming soon` placeholders for core features.
- Keep secrets out of source code.
- Reuse shared helpers instead of duplicating code.

## 29. Important Distinction

```text
frontend/pages/*.html
    → what the user sees

frontend/js/*.js
    → what the page does

backend/routes/*.js
    → API / business operations

backend/models/*.js
    → database structure

backend/middleware/*.js
    → authentication / authorization

backend/services/*.js
    → reusable backend services

frontend/css/*.css
    → appearance and UI behavior
```

When a feature is not working, follow the flow instead of changing random files:

```text
HTML → JS → API Route → Middleware → Model → MongoDB
```
