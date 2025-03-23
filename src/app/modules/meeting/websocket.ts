import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';


export const initWebSocket = (server: HttpServer, corsOrigin: string | string[]) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);

      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
      });

      socket.on('signal', (toId, signal) => {
        io.to(toId).emit('signal', userId, signal);
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export type WebSocketServer = ReturnType<typeof initWebSocket>;