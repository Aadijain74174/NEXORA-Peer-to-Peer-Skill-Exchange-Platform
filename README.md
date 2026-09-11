## Project folder rule

Keep one project root only: `Nexora-Peer-to-Peer-Skill-Exchange/`. Inside it, keep `backend/`, `frontend/`, and `docs/`. Do not create a second nested `NEXORA` folder.

# NEXORA — Peer-to-Peer Skill Exchange Platform

Nexora is a B.Tech CSE full-stack project for peer-to-peer learning. Users can publish the skills they can teach, discover complementary learners, exchange requests, schedule sessions, chat in real time, receive notifications, build reputation and track learning goals.

## Technology stack

- Frontend: HTML5, CSS3, Vanilla JavaScript, Bootstrap 5
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs
- Real-time communication: Socket.IO

## Main features

- Registration and JWT login
- Profile and skill management
- Smart skill matching with an explainable score
- Skill partner search and filters
- Exchange requests with accept/reject/cancel
- Session scheduling using partner name or email
- Dedicated protected Session Room with Join Session
- Monthly calendar backed by real sessions
- One-to-one real-time chat with MongoDB history
- Live notification badge and notification center
- Completed-session ratings and reviews
- Trust score based on completed sessions and ratings
- Skill credits with transparent earned/spent transaction history
- Learning analytics and achievement badges
- Weekly availability slots for partners
- Community reporting and admin moderation
- Learning goals and progress tracking
- Responsive, shared Nexora navigation and design system

## Folder structure

```text
NEXORA-Peer-to-Peer-Skill-Exchange-Platform/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── admin.js
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── ExchangeRequest.js
│   │   ├── Session.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Review.js
│   │   ├── CreditTransaction.js
│   │   └── Report.js
│   │
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
│   │   └── admin.js
│   │
│   └── server.js
│
├── frontend/
│   ├── assets/
│   │   └── nexora-logo.png
│   │
│   ├── css/
│   │   └── style.css
│   │
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
│   │   ├── chat.js
│   │   ├── notifications.js
│   │   ├── calendar.js
│   │   ├── reviews.js
│   │   ├── credits.js
│   │   ├── analytics.js
│   │   ├── admin.js
│   │   └── view-profile.js
│   │
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── profile.html
│   │   ├── find-skills.html
│   │   ├── matches.html
│   │   ├── requests.html
│   │   ├── sessions.html
│   │   ├── session-room.html
│   │   ├── chat.html
│   │   ├── notifications.html
│   │   ├── calendar.html
│   │   ├── reviews.html
│   │   ├── credits.html
│   │   ├── analytics.html
│   │   ├── admin.html
│   │   ├── skills.html
│   │   └── view-profile.html
│   │
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
├── .editorconfig
├── package.json
├── package-lock.json
├── README.md
├── START_HERE.md
└── FINAL_SETUP.md
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Copy `.env.example` to `.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/peer_skill_exchange
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@example.com
```

Make sure MongoDB is running locally, or replace `MONGO_URI` with a MongoDB Atlas connection string.

### 3. Start Nexora

```bash
npm start
```

Open:

`http://localhost:5000`

For development with automatic restart:

```bash
npm run dev
```

## Recommended two-user demo

1. Register User A.
2. Add a teaching skill and a learning skill.
3. Register User B in another browser/incognito window.
4. Add complementary skills to User B.
5. Open Matches and send a request.
6. Accept the request from User A.
7. Use Chat to coordinate.
8. Schedule a session using the partner's registered name/email.
9. Verify both users can see the session and Join Session button.
10. Open Calendar and Session Room.
11. Mark the session completed.
12. Submit a review from each eligible account.
13. Verify rating, trust score, notifications and dashboard values update.

## Security / GitHub

Never commit `.env` or `node_modules/`. Commit `.env.example` and `package-lock.json`.

Recommended `.gitignore` entries:

```text
node_modules/
.env
.DS_Store
```

## Important limitation

The Session Room is an authenticated collaboration room, not a custom WebRTC video-conferencing engine. If a meeting URL is provided, the room exposes it through an **Open meeting link** action rather than pretending Nexora contains a native video system.
