# Chatsy Server

Ephemeral real-time relay for Chatsy.

## Purpose

This server **never stores messages or room history**.

- Rooms live in an in-memory `Map`.
- Messages are received as ciphertext and immediately broadcast to the room.
- When the last user leaves a room, the room is deleted.
- A safety cleanup runs every 10 minutes for empty or very old rooms.

There is no database, no file writes for chat content, and no message logs.

## Tech

- Node.js
- Express
- Socket.io
- uuid (for internal room IDs)
- cors

## Scripts

```bash
npm install
npm run dev     # node --watch index.js
npm start       # production
```

Default port: `3001` (override with `PORT` environment variable).

## API / Events

### HTTP
- `GET /api/health` → `{ status, rooms, message }`

### Socket.io Events (client → server)
| Event          | Payload                          | Description                          |
|----------------|----------------------------------|--------------------------------------|
| `create-room`  | `{ username }`                   | Creates room, returns 6-digit code   |
| `join-room`    | `{ code, username }`             | Joins existing room                  |
| `send-message` | `{ ciphertext, iv, senderId, senderName, timestamp }` | Relays encrypted message |
| `typing`       | `{ isTyping }`                   | Broadcasts typing state              |
| `leave-room`   | —                                | Explicit leave                       |

### Socket.io Events (server → client)
| Event            | Description                              |
|------------------|------------------------------------------|
| `receive-message`| Encrypted message for the room           |
| `room-update`    | Current user list & count                |
| `user-joined`    | Someone joined                           |
| `user-left`      | Someone left                             |
| `user-typing`    | Typing indicator                         |

## Important Notes

- The server **never** decrypts messages.
- The 6-digit code is the only shared secret used by clients for key derivation.
- No authentication beyond the room code is implemented (demo design).
- In production you should add rate limiting, connection limits, and abuse protection.

## Folder Contents

```
server/
├── README.md       # This file
├── package.json    # Dependencies & scripts
└── index.js        # Entire server implementation
```
