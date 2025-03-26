// src/websocket.ts
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IParticipant, IRoom, RoomModel } from '../room/room.model';
import { RoomService } from '../room/room.service';

// Event Type Definitions
interface ServerToClientEvents {
  'user-connected': (userId: string) => void;
  'user-disconnected': (userId: string) => void;
  'user-muted': (userId: string) => void;
  kicked: () => void;
  'new-admin': (userId: string) => void;
  signal: (fromId: string, signal: unknown) => void;
  'room-created': (roomId: string) => void; // Added event
  error: (message: string) => void; // Added error event
}

interface ClientToServerEvents {
  'create-room': (userId: string) => void; // Removed callback
  'join-room': (
    roomId: string,
    userId: string,
    callback: (response: {
      roomId?: string;
      adminId?: string;
      participants?: string[];
      error?: string;
    }) => void
  ) => void;
  'mute-user': (targetUserId: string) => void;
  'remove-user': (targetUserId: string) => void;
  signal: (toId: string, signal: unknown) => void;
}

export const initWebSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: true
    },
    path: '/api/v1/socket.io',
    transports: ['websocket', 'polling'],
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000
    }
  });

  // Add middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Add your JWT verification logic here
    next();
  });


  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('New WebSocket connection:', socket.id);

    // Create Room Handler (Fixed)
    socket.on('create-room', async (userId) => {
      try {
        const room = await RoomService.createRoom(userId);
        const roomId = (room as IRoom)._id.toString();
        
        await RoomService.updateSocketId(roomId, userId, socket.id);
        socket.join(roomId);
        
        // Emit event instead of using callback
        socket.emit('room-created', roomId);
      } catch (error) {
        console.error('Create room error:', error);
        socket.emit('error', 'Failed to create room');
      }
    });

    // Join Room Handler
    socket.on('join-room', async (roomId, userId, callback) => {
      try {
        const room = await RoomService.joinRoom(roomId, userId, socket.id);
        socket.join(roomId);
        socket.data = { userId, roomId };

        // Notify existing participants
        socket.to(roomId).emit('user-connected', userId);

        // Send response through callback
        callback({
          roomId,
          adminId: room.adminId,
          participants: room.participants
            .filter((p: IParticipant) => p.userId !== userId)
            .map((p: IParticipant) => p.userId)
        });

        // Admin control events
        socket.on('mute-user', async (targetUserId) => {
          const room = await RoomService.getRoomById(roomId);
          if (room?.adminId === userId) {
            io.to(roomId).emit('user-muted', targetUserId);
          }
        });

        socket.on('remove-user', async (targetUserId) => {
          const room = await RoomService.getRoomById(roomId);
          if (room?.adminId === userId) {
            const target = room.participants.find((p: IParticipant) => p.userId === targetUserId);
            if (target) {
              io.to(target.socketId).emit('kicked');
              await RoomService.leaveRoom(roomId, targetUserId);
              socket.to(roomId).emit('user-disconnected', targetUserId);
            }
          }
        });

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
        console.error('Join room error:', errorMessage);
        callback({ error: errorMessage });
      }
    });

    // Signal Handling
    socket.on('signal', (toId, signal) => {
      io.to(toId).emit('signal', socket.id, signal);
    });

    // Disconnect Handler
    socket.on('disconnect', async () => {
      try {
        const rooms = await RoomModel.find({ 'participants.socketId': socket.id });
        
        for (const room of rooms) {
          const typedRoom = room as IRoom;
          const participant = typedRoom.participants.find(p => p.socketId === socket.id);
          
          if (participant) {
            await RoomService.leaveRoom(typedRoom._id.toString(), participant.userId);
            socket.to(typedRoom._id.toString()).emit('user-disconnected', participant.userId);
          }
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return io;
};