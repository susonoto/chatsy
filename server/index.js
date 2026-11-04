const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve static client build in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// In-memory only. No persistence. Rooms die when empty or server restarts.
const rooms = new Map(); // code -> { id, code, createdAt, users: Map(socketId -> {id, name, joinedAt}) }

function generateCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));
  return code;
}

function getRoomUsers(room) {
  return Array.from(room.users.values()).map(u => ({ id: u.id, name: u.name }));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, message: 'No data is stored. Ephemeral only.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', ({ username }, callback) => {
    const code = generateCode();
    const roomId = uuidv4();
    const room = {
      id: roomId,
      code,
      createdAt: Date.now(),
      users: new Map()
    };
    rooms.set(code, room);

    const user = { id: socket.id, name: username || 'Anonymous', joinedAt: Date.now() };
    room.users.set(socket.id, user);
    socket.join(code);
    socket.roomCode = code;
    socket.username = user.name;

    console.log(`Room ${code} created by ${user.name}`);

    const users = getRoomUsers(room);

    // Send full state in the callback so client has users immediately
    callback({
      success: true,
      code,
      roomId,
      userId: socket.id,
      users,
      userCount: users.length
    });

    // Also broadcast (for consistency)
    io.to(code).emit('room-update', {
      code,
      userCount: users.length,
      users
    });
  });

  socket.on('join-room', ({ code, username }, callback) => {
    const room = rooms.get(code);
    if (!room) {
      return callback({ success: false, error: 'Room not found or expired' });
    }

    // Prevent duplicate join from same socket
    if (room.users.has(socket.id)) {
      const users = getRoomUsers(room);
      return callback({
        success: true,
        code,
        roomId: room.id,
        userId: socket.id,
        users,
        userCount: users.length
      });
    }

    const user = { id: socket.id, name: username || 'Anonymous', joinedAt: Date.now() };
    room.users.set(socket.id, user);
    socket.join(code);
    socket.roomCode = code;
    socket.username = user.name;

    console.log(`${user.name} joined room ${code} (${room.users.size} online)`);

    const users = getRoomUsers(room);

    // Critical: send current users list in the callback
    callback({
      success: true,
      code,
      roomId: room.id,
      userId: socket.id,
      users,
      userCount: users.length
    });

    // Notify others
    socket.to(code).emit('user-joined', { id: user.id, name: user.name });

    // Broadcast updated list to everyone in the room
    io.to(code).emit('room-update', {
      code,
      userCount: users.length,
      users
    });
  });

  // Messages are already encrypted client-side. Server just relays ciphertext.
  // No decryption, no storage, no logging of content.
  socket.on('send-message', ({ ciphertext, iv, senderId, senderName, timestamp }) => {
    const code = socket.roomCode;
    if (!code || !rooms.has(code)) return;

    // Only relay to others. Never store. Never send history.
    socket.to(code).emit('receive-message', {
      ciphertext,
      iv,
      senderId,
      senderName,
      timestamp: timestamp || Date.now()
    });
  });

  socket.on('typing', ({ isTyping }) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('user-typing', {
      userId: socket.id,
      username: socket.username,
      isTyping
    });
  });

  socket.on('leave-room', () => {
    leaveRoom(socket);
  });

  socket.on('disconnect', () => {
    leaveRoom(socket);
    console.log('User disconnected:', socket.id);
  });
});

function leaveRoom(socket) {
  const code = socket.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  if (!room) return;

  room.users.delete(socket.id);
  socket.to(code).emit('user-left', { id: socket.id, name: socket.username });

  if (room.users.size === 0) {
    rooms.delete(code);
    console.log(`Room ${code} destroyed (empty)`);
  } else {
    const users = getRoomUsers(room);
    io.to(code).emit('room-update', {
      code,
      userCount: users.length,
      users
    });
  }
  socket.leave(code);
  delete socket.roomCode;
  delete socket.username;
}

// Cleanup old empty rooms every 10 min
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (room.users.size === 0 || now - room.createdAt > 24 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chatsy Chat Server running on http://localhost:${PORT}`);
  console.log('No messages or rooms are persisted. True ephemeral.');
});
