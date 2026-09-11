# Nexora — Final Local Testing Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Create `.env`

Create `.env` in the project root next to `package.json`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/peer_skill_exchange
JWT_SECRET=replace_with_a_long_random_secret
```

## 3. Start MongoDB

Make sure the MongoDB Windows service or your Atlas database is available.

## 4. Start Nexora

```bash
npm start
```

Open `http://localhost:5000`.

## 5. Main implemented areas

- Partner lookup by registered email or name
- Session scheduling with duration and notes
- Protected Session Room + Join Session
- Shared responsive navbar on every page
- Smart matching
- Skill search and filters
- Exchange request workflow
- Real-time Socket.IO chat
- Notifications + unread badge
- Monthly calendar
- Completed-session ratings and reviews
- Skill credits
- Trust score
- Learning goals and progress
- Responsive Nexora visual design

## Verification note

The code has been syntax-checked and the HTTP health route was smoke-tested in the available environment. A real MongoDB-backed end-to-end two-user test still needs to be run on a machine with MongoDB available.
