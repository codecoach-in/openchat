import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected to Socket: ${socket.id}`);

  socket.on('join-room', (data) => {
    // Socket.IO details will be fully wired in Milestone 3
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected from Socket: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
