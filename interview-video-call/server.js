import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  const { roomId, username } = socket.handshake.auth;
  
  if (roomId) {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
  }

  // Handle join requests
  socket.on('request_join', ({ roomId, username }) => {
    const interviewers = Array.from(rooms.get(roomId) || []);
    if (interviewers.length > 0) {
      io.to(interviewers[0]).emit('join_request', {
        username,
        userId: socket.id
      });
    }
  });

  socket.on('approve_join', ({ userId }) => {
    io.to(userId).emit('join_approved');
  });

  socket.on('reject_join', ({ userId }) => {
    io.to(userId).emit('join_rejected');
  });

  // Handle WebRTC signaling
  socket.on('signal', ({ signal, to }) => {
    io.to(to).emit('signal', {
      signal,
      from: socket.id
    });
  });

  // Handle code sync
  socket.on('code_sync', ({ content }) => {
    socket.to(roomId).emit('code_sync', { content });
  });

  // Handle chat messages
  socket.on('chat_message', (message) => {
    socket.to(roomId).emit('chat_message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});