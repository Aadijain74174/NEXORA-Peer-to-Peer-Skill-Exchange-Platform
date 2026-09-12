# NEXORA — Peer-to-Peer Skill Exchange Platform

Nexora is a B.Tech CSE full-stack web application designed for peer-to-peer learning and skill exchange. Users can publish the skills they can teach, discover complementary learners, send exchange requests, schedule learning sessions, communicate through real-time chat, receive notifications, rate completed sessions, earn skill credits, track goals, and build a reputation through trust and reviews.

## Project Highlights

- Peer-to-peer skill teaching and learning
- Public Explore Skills experience
- User profiles with teaching and learning skills
- Smart skill matching with explainable compatibility scores
- Skill search and filtering
- Exchange requests with accept, reject, and cancel actions
- Session scheduling using a partner's name or email
- Protected Session Room with Join Session support
- Monthly calendar backed by scheduled sessions
- One-to-one real-time chat using Socket.IO
- Notification center and unread notification badge
- Ratings and reviews after eligible sessions
- Trust score and user reputation
- Skill credits with transaction history
- Learning goals and progress tracking
- Achievement badges
- Weekly availability slots with starting and ending time
- Community reporting and admin moderation
- Analytics dashboard
- Contact Us form
- Forgot Password and Reset Password flow
- Email support through the Nexora mailer configuration
- Professional shared navigation
- Responsive UI and lightweight page animations
- About Us page

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Bootstrap 5 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Real-time communication | Socket.IO |
| Email | Nodemailer / Gmail SMTP configuration |
| Package management | npm |

## Application Flow

```text
Visitor
   |
   +--> Home / About Us / Explore Skills
   |
   +--> Register / Login
              |
              v
        User Dashboard
              |
    +---------+---------+----------------+
    |         |         |                |
  Skills   Matches   Requests         Profile
    |         |         |                |
    +---------+---------+----------------+
              |
          Sessions
              |
      +-------+-------+
      |               |
   Calendar          Chat
      |               |
 Notifications   Reviews/Ratings
              |
       Credits / Trust
              |
       Learning Goals
```

## Core Modules

### 1. Authentication

Users can register and log in securely. Passwords are hashed and authenticated sessions use JWT.

Password recovery includes:
- Forgot Password request
- Time-limited reset token
- Reset Password page
- Optional email delivery through the configured mailer

### 2. Profile and Skills

Users can maintain their profile, teaching skills, learning skills, experience, education, learning goals, achievements, and weekly availability.

Availability uses clear:
- Starting Time
- Ending Time

A slot is accepted only when the ending time is later than the starting time.

### 3. Explore Skills and Matching

Visitors can open Explore Skills and browse available skill partners without being forced directly to the login page.

The authenticated matching system provides explainable compatibility scores based on relevant profile and skill information.

### 4. Exchange Requests

Users can send requests to suitable partners and manage:
- Received requests
- Sent requests
- Accept
- Reject
- Cancel

### 5. Sessions and Calendar

Users can schedule sessions with a partner using the partner's registered name or email.

Scheduled sessions are visible to the relevant users and can be opened through the Session Room / Join Session flow. The monthly calendar displays scheduled sessions.

### 6. Real-Time Chat

Nexora provides one-to-one messaging with:
- Conversation history
- MongoDB message persistence
- Read/unread state
- Socket.IO real-time communication

### 7. Notifications

Users receive application notifications for relevant activities. The shared navbar also provides an unread notification badge.

### 8. Reviews and Trust

Eligible completed sessions can be reviewed. Ratings and reviews contribute to the user's reputation and trust-related information.

### 9. Skill Credits

Completed learning exchanges can contribute to skill credits. Users can view their balance and transaction history.

### 10. Learning Progress and Achievements

Users can define learning goals, track progress, and earn achievement badges.

### 11. Admin and Reporting

The platform includes reporting and administrative moderation functionality for managing reported users and platform activity.

### 12. Contact Us

Visitors can submit:
- Name
- Email
- Subject
- Message

Contact messages are stored in MongoDB for handling by the application.

### 13. About Us

The About Us page explains Nexora's purpose, peer learning model, skill exchange concept, and mission.

## Folder Structure

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
│   │   ├── Report.js
│   │   ├── ContactMessage.js
│   │   └── PasswordResetToken.js
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
│   │   ├── admin.js
│   │   └── contact.js
│   │
│   ├── services/
│   │   └── mailer.js
│   │
│   └── server.js
│
├── frontend/
│   ├── assets/
│   │   └── nexora-logo.png
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── navbar.css
│   │   └── animations.css
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
│   │   ├── view-profile.js
│   │   ├── contact.js
│   │   ├── forgot-password.js
│   │   └── reset-password.js
│   │
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
│   │   ├── chat.html
│   │   ├── notifications.html
│   │   ├── calendar.html
│   │   ├── reviews.html
│   │   ├── credits.html
│   │   ├── analytics.html
│   │   ├── admin.html
│   │   ├── view-profile.html
│   │   ├── contact.html
│   │   ├── about.html
│   │   ├── forgot-password.html
│   │   └── reset-password.html
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

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Copy `.env.example` to `.env`.

Typical local configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/peer_skill_exchange
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@example.com
```

If email delivery is enabled, also configure the mailer variables used by the project, for example:

```env
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-google-app-password
```

Use a Google App Password rather than a normal Gmail password when using Gmail SMTP.

Never commit `.env` or real credentials.

### 3. Start Nexora

```bash
npm start
```

Open:

```text
http://localhost:5000
```

For development with automatic restart:

```bash
npm run dev
```

## Recommended Two-User Demo

1. Register User A.
2. Add a skill User A can teach and a skill User A wants to learn.
3. Register User B in another browser/incognito window.
4. Add complementary skills to User B.
5. Open Explore Skills / Find Skills and verify partner discovery.
6. Open Matches and inspect the compatibility score and reasons.
7. Send an exchange request.
8. Accept the request from the other account.
9. Use Chat to coordinate.
10. Schedule a session using the partner's registered name or email.
11. Verify both users can see the scheduled session and Join Session option.
12. Open Calendar and Session Room.
13. Complete the session.
14. Submit eligible reviews.
15. Verify dashboard, ratings, trust information, notifications, and credits update.
16. Test Contact Us.
17. Test Forgot Password / Reset Password.

## Documentation

- `docs/DEVELOPMENT_GUIDE.md` — where to make changes and how the application flows
- `docs/PROJECT_STRUCTURE.md` — project architecture and folder responsibilities
- `docs/API_OVERVIEW.md` — backend API route reference
- `docs/CODE_STYLE.md` — coding and readability conventions

## GitHub / Team Workflow

Before working:

```bash
git pull origin main
```

For a feature:

```bash
git checkout -b feature/your-feature-name
```

After testing:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/your-feature-name
```

Create a Pull Request on GitHub for team review.

## Security

Never commit:

```text
.env
node_modules/
real passwords
API keys
private database credentials
```

Commit `.env.example` and `package-lock.json`.

## Future Scope

Possible future improvements include:
- AI-assisted skill recommendations
- More advanced matching using availability, ratings, and interests
- Session reminders
- Email notifications for important events
- More detailed analytics
- Leaderboards and expanded gamification
- Online deployment with MongoDB Atlas
- Automated testing
- Email verification

## Project Note

Nexora is designed as a peer-to-peer skill exchange platform rather than a traditional course marketplace. Its core idea is that users can be both learners and contributors: one user can teach a skill while learning another skill from the community.
