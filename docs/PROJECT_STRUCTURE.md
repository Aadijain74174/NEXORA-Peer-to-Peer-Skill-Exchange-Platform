# Nexora Project Structure

## 1. Project Folder Rule

Keep one project root only:

```text
NEXORA-Peer-to-Peer-Skill-Exchange-Platform/
```

Do not create a second nested `NEXORA` folder.

## 2. Root Structure

```text
NEXORA-Peer-to-Peer-Skill-Exchange-Platform/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── admin.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── ExchangeRequest.js
│   │   ├── Session.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Review.js
│   │   ├── CreditTransaction.js
│   │   ├── Report.js
│   │   ├── ContactMessage.js
│   │   └── PasswordResetToken.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── skills.js
│   │   ├── matches.js
│   │   ├── requests.js
│   │   ├── sessions.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── reviews.js
│   │   ├── credits.js
│   │   ├── reports.js
│   │   ├── analytics.js
│   │   ├── admin.js
│   │   └── contact.js
│   ├── services/
│   │   └── mailer.js
│   └── server.js
│
├── frontend/
│   ├── assets/
│   │   └── nexora-logo.png
│   ├── css/
│   │   ├── style.css
│   │   ├── navbar.css
│   │   └── animations.css
│   ├── js/
│   │   ├── main.js
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
│   │   ├── admin.js
│   │   ├── view-profile.js
│   │   ├── contact.js
│   │   ├── forgot-password.js
│   │   └── reset-password.js
│   ├── pages/
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
│   │   ├── admin.html
│   │   ├── view-profile.html
│   │   ├── contact.html
│   │   ├── about.html
│   │   ├── forgot-password.html
│   │   └── reset-password.html
│   └── index.html
│
├── docs/
│   ├── DEVELOPMENT_GUIDE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── API_OVERVIEW.md
│   └── CODE_STYLE.md
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 3. Request Flow

```text
Browser
   ↓
frontend/pages/*.html
   ↓
frontend/js/*.js
   ↓
main.js / API helper
   ↓
backend/routes/*.js
   ↓
backend/middleware/*.js
   ↓
backend/models/*.js
   ↓
MongoDB
```

## 4. Real-Time Flow

```text
Chat / Notifications
        ↕
    Socket.IO
        ↕
backend/server.js
```

## 5. Main Responsibilities

| Folder | Responsibility |
|---|---|
| `backend/config` | Database configuration |
| `backend/middleware` | Authentication and authorization |
| `backend/models` | MongoDB/Mongoose data structures |
| `backend/routes` | API endpoints and business operations |
| `backend/services` | Reusable backend services such as email |
| `frontend/pages` | User-facing HTML screens |
| `frontend/js` | Page behavior and API interaction |
| `frontend/css` | Shared visual design, navbar and animations |
| `frontend/assets` | Images and branding |
| `docs` | Project documentation |

## 6. Public and Protected Experience

Public pages can include:

```text
/
about.html
find-skills.html
contact.html
login.html
register.html
forgot-password.html
reset-password.html
```

Authenticated features include the dashboard, profile management, matching actions, requests, sessions, chat, notifications, credits, analytics, reviews, and other account-specific operations.

Explore Skills is intended to allow discovery before authentication; actions that require an account can redirect the visitor to login.

## 7. Where to Look for a Feature

```text
UI / page
   → frontend/pages/

Page behavior
   → frontend/js/

API/business logic
   → backend/routes/

Database structure
   → backend/models/

Authentication
   → backend/middleware/auth.js

Admin authorization
   → backend/middleware/admin.js

Shared services
   → backend/services/

Global design
   → frontend/css/
```
