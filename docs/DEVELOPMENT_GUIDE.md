# Nexora Development Guide

This guide is the quick map for anyone working on the Nexora — Peer-to-Peer Skill Exchange Platform.
Use it to find **exactly where to make a change** before editing the code.

> **Project root:** `Nexora-Peer-to-Peer-Skill-Exchange/`
>
> Do not create another `NEXORA` folder inside the project. The root should directly contain `backend`, `frontend`, and `docs`.

---

## 1. Project structure

```text
Nexora-Peer-to-Peer-Skill-Exchange/
│
├── backend/                         # Server-side code
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication middleware
│   │   └── admin.js                 # Admin authorization middleware
│   ├── models/                      # MongoDB/Mongoose models
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── ExchangeRequest.js
│   │   ├── Session.js
│   │   ├── Review.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── CreditTransaction.js
│   │   └── Report.js
│   ├── routes/                      # REST API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── skills.js
│   │   ├── matches.js
│   │   ├── requests.js
│   │   ├── sessions.js
│   │   ├── reviews.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── credits.js
│   │   ├── reports.js
│   │   ├── analytics.js
│   │   └── admin.js
│   └── server.js                    # Express + Socket.IO entry point
│
├── frontend/
│   ├── assets/
│   │   └── nexora-logo.png          # Brand logo
│   ├── css/
│   │   └── style.css                # Global UI/design system
│   ├── js/                           # Page JavaScript
│   │   ├── main.js                  # Shared navbar, auth helpers, API helpers
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── profile.js
│   │   ├── skills.js
│   │   ├── find-skills.js
│   │   ├── matches.js
│   │   ├── requests.js
│   │   ├── sessions.js
│   │   ├── session-room.js
│   │   ├── calendar.js
│   │   ├── chat.js
│   │   ├── notifications.js
│   │   ├── reviews.js
│   │   ├── credits.js
│   │   ├── analytics.js
│   │   ├── view-profile.js
│   │   └── admin.js
│   ├── pages/                        # HTML screens
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── profile.html
│   │   ├── skills.html
│   │   ├── find-skills.html
│   │   ├── matches.html
│   │   ├── requests.html
│   │   ├── sessions.html
│   │   ├── session-room.html
│   │   ├── calendar.html
│   │   ├── chat.html
│   │   ├── notifications.html
│   │   ├── reviews.html
│   │   ├── credits.html
│   │   ├── analytics.html
│   │   ├── view-profile.html
│   │   └── admin.html
│   └── index.html                    # Landing page
│
├── docs/                             # Documentation
│   ├── DEVELOPMENT_GUIDE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── API_OVERVIEW.md
│   └── CODE_STYLE.md
│
├── .env.example                      # Safe template; commit this
├── .gitignore                        # Keeps .env/node_modules out of Git
├── package.json                      # Dependencies + scripts
├── package-lock.json                 # Exact dependency versions
├── README.md
├── START_HERE.md
└── FINAL_SETUP.md
```

### Architecture flow

```text
User
  │
  ▼
Frontend HTML
  │
  ▼
Page JavaScript
  │
  ▼
main.js / API helper
  │
  ▼
Express routes
  │
  ├── auth middleware
  └── admin middleware (where required)
  │
  ▼
Mongoose models
  │
  ▼
MongoDB

Real-time chat/notifications
  Frontend ↔ Socket.IO ↔ backend/server.js
```

---

## 2. Where do I make a change?

### Authentication / Login

| What you want to change | File |
|---|---|
| Login page UI | `frontend/pages/login.html` |
| Login form behavior | `frontend/js/login.js` |
| Register page UI | `frontend/pages/register.html` |
| Registration behavior | `frontend/js/register.js` |
| Login/register API | `backend/routes/auth.js` |
| Password hashing | `backend/routes/auth.js` |
| JWT token creation | `backend/routes/auth.js` |
| JWT validation | `backend/middleware/auth.js` |
| User account fields | `backend/models/User.js` |

### Password

There is currently no separate password page. Password-related backend logic is in:

```text
backend/routes/auth.js
backend/models/User.js
```

If you add **Change Password** later, create a route in `backend/routes/auth.js` and a UI/action in `frontend/pages/profile.html` + `frontend/js/profile.js`.

### Dashboard

| What you want to change | File |
|---|---|
| Dashboard layout/cards | `frontend/pages/dashboard.html` |
| Dashboard data/rendering | `frontend/js/dashboard.js` |
| User data | `backend/routes/users.js` |
| Session data | `backend/routes/sessions.js` |
| Request data | `backend/routes/requests.js` |
| Match data | `backend/routes/matches.js` |
| Goal data | `backend/routes/users.js` |
| Notification/activity data | `backend/routes/notifications.js` |
| Dashboard styling | `frontend/css/style.css` |

### Navbar / Global UI

```text
frontend/js/main.js     # Shared navbar + common helpers
frontend/css/style.css  # Global styles
```

If a navigation item, logout behavior, auth check, toast, API helper, or global socket behavior needs changing, start with `frontend/js/main.js`.

### Profile

```text
frontend/pages/profile.html
frontend/js/profile.js
backend/routes/users.js
backend/models/User.js
```

Use these files for profile information, bio, education, experience, availability, learning goals, skills, and achievements.

### Skills

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

### Find Skills / Search

```text
frontend/pages/find-skills.html
frontend/js/find-skills.js
backend/routes/users.js
```

### Smart Matches

```text
frontend/pages/matches.html
frontend/js/matches.js
backend/routes/matches.js
backend/models/User.js
```

The matching score/reasons are generated by the backend; the page only displays the returned result.

### Requests

```text
frontend/pages/requests.html
frontend/js/requests.js
backend/routes/requests.js
backend/models/ExchangeRequest.js
```

### Sessions / Schedule / Join Session

```text
frontend/pages/sessions.html
frontend/js/sessions.js
frontend/pages/session-room.html
frontend/js/session-room.js
backend/routes/sessions.js
backend/models/Session.js
```

Meeting-link/session completion/credits logic belongs primarily in `backend/routes/sessions.js`.

### Calendar

```text
frontend/pages/calendar.html
frontend/js/calendar.js
backend/routes/sessions.js
```

### Chat

```text
frontend/pages/chat.html
frontend/js/chat.js
backend/routes/messages.js
backend/models/Message.js
backend/server.js          # Socket.IO real-time events
```

### Notifications

```text
frontend/pages/notifications.html
frontend/js/notifications.js
frontend/js/main.js
backend/routes/notifications.js
backend/models/Notification.js
backend/server.js          # Real-time notification events
```

### Ratings / Reviews

```text
frontend/pages/reviews.html
frontend/js/reviews.js
frontend/js/sessions.js
backend/routes/reviews.js
backend/models/Review.js
```

### Skill Credits

```text
frontend/pages/credits.html
frontend/js/credits.js
backend/routes/credits.js
backend/routes/sessions.js
backend/models/CreditTransaction.js
backend/models/User.js
```

### Trust Score

The trust score is stored on the user and recalculated by backend logic. Start with:

```text
backend/models/User.js
backend/routes/users.js
backend/routes/reviews.js
backend/routes/sessions.js
```

### Analytics

```text
frontend/pages/analytics.html
frontend/js/analytics.js
backend/routes/analytics.js
```

### Public Profile / Report User

```text
frontend/pages/view-profile.html
frontend/js/view-profile.js
backend/routes/users.js
backend/routes/reports.js
backend/models/Report.js
```

### Admin Dashboard

```text
frontend/pages/admin.html
frontend/js/admin.js
backend/routes/admin.js
backend/middleware/admin.js
backend/models/User.js
backend/models/Report.js
```

---

## 3. Frontend page → JavaScript map

| Page | Main JavaScript |
|---|---|
| `index.html` | `main.js` |
| `login.html` | `login.js` |
| `register.html` | `register.js` |
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

Most pages also load `main.js` for shared navigation, authentication, API helpers, and common UI utilities.

---

## 4. Backend route map

| API area | Route file | Main purpose |
|---|---|---|
| Auth | `backend/routes/auth.js` | Register, login, current user |
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

---

## 5. Where to change the design?

### Global design

```text
frontend/css/style.css
```

Change colors, typography, buttons, cards, spacing, responsive rules, navbar styling, badges, and shared components here.

### One specific page

Prefer adding a page-specific class in the HTML and then styling that class in `style.css`, instead of adding large inline `style="..."` blocks.

### Logo

```text
frontend/assets/nexora-logo.png
```

Navbar placement/size is controlled through `frontend/js/main.js` and `frontend/css/style.css`.

---

## 6. Environment variables

Local `.env` is private and must **not** be committed. Use `.env.example` as the safe template.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/peer_skill_exchange
JWT_SECRET=your_secret_here
ADMIN_EMAIL=admin@example.com
```

Never put real secrets, passwords, or private database credentials in GitHub.

---

## 7. Safe workflow for team members

Before editing:

```bash
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/profile-improvements
```

After making and testing changes:

```bash
git add .
git commit -m "Improve profile page"
git push -u origin feature/profile-improvements
```

Then open a Pull Request on GitHub.

Avoid directly changing `main` for large features.

---

## 8. Before you edit a feature

Use this sequence:

```text
1. Find the page in frontend/pages/
          ↓
2. Open its matching frontend/js/ file
          ↓
3. If data/API is involved, open backend/routes/
          ↓
4. If database fields are involved, open backend/models/
          ↓
5. If authentication is involved, check backend/middleware/auth.js
          ↓
6. If styling is involved, check frontend/css/style.css
```

This prevents changing the wrong file.

---

## 9. Quick examples

**“Login button ka design change karna hai”**

→ `frontend/pages/login.html` + `frontend/css/style.css`

**“Login ka logic change karna hai”**

→ `frontend/js/login.js` + `backend/routes/auth.js`

**“Password change feature add karna hai”**

→ `frontend/pages/profile.html` + `frontend/js/profile.js` + `backend/routes/auth.js`

**“Dashboard mein new card add karna hai”**

→ `frontend/pages/dashboard.html` + `frontend/js/dashboard.js`

**“Dashboard card ka data database se lana hai”**

→ dashboard files + relevant `backend/routes/*.js` + `backend/models/*.js`

**“Chat ka UI change karna hai”**

→ `frontend/pages/chat.html` + `frontend/js/chat.js` + `frontend/css/style.css`

**“Chat real-time logic change karna hai”**

→ `frontend/js/chat.js` + `backend/server.js`

**“Calendar mein sessions change karne hain”**

→ `frontend/js/calendar.js` + `backend/routes/sessions.js`

**“Rating calculation change karna hai”**

→ `backend/routes/reviews.js` + `backend/models/Review.js`

**“Admin block/unblock logic change karna hai”**

→ `frontend/js/admin.js` + `backend/routes/admin.js` + `backend/middleware/admin.js`

---

## 10. Code readability rules

- Keep HTML properly indented.
- Keep one major HTML element/group per logical block.
- Use meaningful IDs/classes.
- Keep page logic in the matching `frontend/js/*.js` file.
- Keep API/database logic in `backend/routes` and `backend/models`.
- Do not put secrets in source code.
- Do not commit `.env` or `node_modules`.
- Reuse `main.js` and `style.css` instead of duplicating shared code.
- Add a short comment when a piece of logic is not obvious.

---

## 11. Important distinction

`frontend/pages/*.html` controls **what the user sees**.

`frontend/js/*.js` controls **what the page does**.

`backend/routes/*.js` controls **API/business operations**.

`backend/models/*.js` controls **database structure**.

`backend/middleware/*.js` controls **authentication/authorization**.

`frontend/css/style.css` controls **appearance**.

When a feature is not working, follow the flow instead of changing random files:

```text
HTML → JS → API Route → Middleware → Model → MongoDB
```
