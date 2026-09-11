# API Overview

All API endpoints are prefixed with `/api`.

| Area | Endpoint examples | Auth |
| --- | --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Mixed |
| Users | `GET /users`, `GET /users/:id`, `PUT /users/:id` | Yes |
| Goals | `GET/POST /users/me/goals`, `PUT/DELETE /users/me/goals/:goalId` | Yes |
| Skills | `GET/POST /skills` | Yes |
| Matches | `GET /matches` | Yes |
| Requests | `POST /requests`, `GET /requests/received`, `GET /requests/sent` | Yes |
| Requests | `PUT /requests/:id/accept`, `/reject`, `/cancel` | Yes |
| Sessions | `POST /sessions`, `GET /sessions`, `GET /sessions/:id` | Yes |
| Sessions | `PUT /sessions/:id/complete`, `/cancel` | Yes |
| Reviews | `POST /reviews`, `GET /reviews/:userId` | Yes |
| Reviews | `GET /reviews/session/:sessionId` | Yes |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` | Yes |
| Messages | `GET /messages/with/:userId`, `POST /messages` | Yes |
| Messages | `PUT /messages/with/:userId/read`, `GET /messages/unread-count` | Yes |
| Health | `GET /health` | No |

The API uses JSON and returns a `success` boolean with a human-readable `message` for errors.
