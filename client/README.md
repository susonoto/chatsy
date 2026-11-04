# Chatsy Client

Modern React frontend for the Chatsy zero-trace chat application.

## Requirements

- **Node.js 18+** (tested on 18.19 and 20+)
- npm 9+

## Purpose

- Beautiful, responsive UI with three theme modes
- Client-side end-to-end encryption
- Real-time communication via Socket.io
- Optional local-only message history (localStorage)
- Fully animated with Framer Motion

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS v3 + PostCSS
- Framer Motion
- Lucide React (icons)
- Socket.io-client
- Web Crypto API (encryption)

## Scripts

```bash
# Clean install (recommended if you hit native-binding errors)
rm -rf node_modules package-lock.json
npm install

npm run dev       # Development server on :5173 (proxies Socket.io → :3001)
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Theme System

Themes are controlled via the `data-theme` attribute on `<html>`:

- (none / default) → Glassmorphism
- `neomorphism` → Soft extruded look
- `night` → Dark red/pink glass

All colors are CSS custom properties defined in `src/index.css`.  
Theme preference is persisted in `localStorage`.

## Encryption Flow (Client)

1. User joins or creates a room with a 6-digit code.
2. `utils/crypto.ts` derives an AES-256-GCM key from the code (PBKDF2).
3. Outgoing messages are encrypted before `socket.emit('send-message')`.
4. Incoming ciphertext is decrypted before being shown in the UI.
5. The server never sees plaintext.

## Local History

`utils/storage.ts` optionally saves the last ~200 messages **only in the user’s browser** under the key `chatsy_chat_<code>`.

## Folder Structure

```
client/
├── README.md
├── package.json
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── Lobby.tsx
    │   ├── ChatRoom.tsx
    │   ├── ThemeSwitcher.tsx
    │   └── Background.tsx
    └── utils/
        ├── crypto.ts
        ├── storage.ts
        └── cn.ts
```

## Troubleshooting

### “Cannot find native binding” / Tailwind oxide errors
This project uses **Tailwind CSS v3** (not v4) so it works on Node 18.  
If you still see the error, delete lockfile + modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript / unused variable errors
All known unused symbols have been cleaned. Run `npm run build` after a clean install.

### Socket connection fails
Make sure the server is running on port 3001 first:

```bash
cd ../server && npm install && npm run dev
```
