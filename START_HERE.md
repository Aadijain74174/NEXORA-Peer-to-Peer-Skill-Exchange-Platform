# START HERE — NEXORA

## 1. Requirements

- Node.js 18+
- MongoDB local or MongoDB Atlas
- VS Code
- Git (for team collaboration)

## 2. Project structure

The project should have **one root folder only**:

```text
Nexora-Peer-to-Peer-Skill-Exchange/
├── backend/
├── frontend/
├── docs/
├── package.json
├── package-lock.json
├── .env.example
└── .gitignore
```

Do not create `NEXORA/NEXORA` or another nested project folder.

## 3. Install dependencies

Open a terminal in the project root:

```bash
npm install
```

## 4. Environment

Create `.env` next to `package.json` using `.env.example`.

Example for local MongoDB:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/peer_skill_exchange
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@example.com
```

Never commit `.env` to GitHub. Commit `.env.example` instead.

## 5. Run

```bash
npm start
```

Open:

```text
http://localhost:5000
```

## 6. Fast two-user demo

1. Register User A.
2. User A: Profile → add `C++` to teach and `Python` to learn.
3. Open another browser/incognito window and register User B.
4. User B: add `Python` to teach and `C++` to learn.
5. Open Matches and send an exchange request.
6. User A accepts it in Requests.
7. Open Chat and send a real-time message.
8. Schedule a session using the other user's registered name/email.
9. Verify both accounts see the session.
10. Click **Join Session** to open the protected Session Room.
11. Open Calendar to see the scheduled session.
12. Mark the session completed.
13. Submit a rating/review and verify reputation/notification updates.

## 7. If you need to change something

First open:

```text
docs/DEVELOPMENT_GUIDE.md
```

It contains a feature-to-file map showing exactly where to edit authentication, password/login, dashboard, profile, skills, matching, requests, sessions, calendar, chat, notifications, reviews, credits, admin, and analytics.

## 8. If something fails

- MongoDB connection error → make sure MongoDB is running and `MONGO_URI` is correct.
- JWT secret error → create `.env` from `.env.example`.
- Port in use → change `PORT` in `.env`.
- Authentication error → log in again and refresh the page.

## 9. GitHub team rule

Keep `main` stable. Create feature branches and use Pull Requests for team changes.

Never commit:

```text
.env
node_modules/
```
