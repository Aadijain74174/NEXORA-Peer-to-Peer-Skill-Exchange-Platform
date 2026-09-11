# Nexora Project Structure

The project uses a **single root folder**. Do not create `NEXORA/NEXORA`.

```text
Nexora-Peer-to-Peer-Skill-Exchange/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── index.html
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── START_HERE.md
└── FINAL_SETUP.md
```

## Request flow

```text
Browser
  ↓
frontend/pages/*.html
  ↓
frontend/js/*.js
  ↓
backend/routes/*.js
  ↓
backend/middleware/*.js
  ↓
backend/models/*.js
  ↓
MongoDB
```

## Real-time flow

```text
Chat / Notifications
       ↕
Socket.IO
       ↕
backend/server.js
```
