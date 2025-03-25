// src/websocket.ts
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IParticipant, IRoom, RoomModel } from '../room/room.model';
import { RoomService } from '../room/room.service';

// ইভেন্ট টাইপ ডিফাইনিশন
interface ServerToClientEvents {
  'user-connected': (userId: string) => void;
  'user-disconnected': (userId: string) => void;
  'user-muted': (userId: string) => void;
  kicked: () => void;
  'new-admin': (userId: string) => void;
  signal: (fromId: string, signal: unknown) => void;
}

interface ClientToServerEvents {
  'create-room': (userId: string, callback: (response: { roomId?: string; error?: string }) => void) => void;
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



export const initWebSocket = (server: HttpServer, ) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['socket.io-version'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true // For Socket.io v2/v3 compatibility
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('New WebSocket connection:', socket.id);

socket.on('create-room', async (userId, callback) => {
  try {
    const room = await RoomService.createRoom(userId);
    // Type Assertion যোগ করুন
    const roomId = (room as IRoom)._id.toString();
    
    await RoomService.updateSocketId(roomId, userId, socket.id);
    socket.join(roomId);
    callback({ roomId });
  } catch (error) {
    console.error('Create room error:', error);
    callback({ error: 'Failed to create room' });
  }
});

    // রুমে যোগদান ইভেন্ট
    socket.on('join-room', async (roomId, userId, callback) => {
      try {
        const room = await RoomService.joinRoom(roomId, userId, socket.id);
        socket.join(roomId);
        socket.data = { userId, roomId };
        
        // এক্সিস্টিং পার্টিসিপ্যান্টদের নোটিফাই
        socket.to(roomId).emit('user-connected', userId);
        
        callback({
          roomId,
          adminId: room.adminId,
          participants: room.participants
            .filter((p: IParticipant) => p.userId !== userId)
            .map((p: IParticipant) => p.userId),
        });

        // এডমিন কন্ট্রোল ইভেন্টস
        socket.on('mute-user', async (targetUserId: string) => {
          const room = await RoomService.getRoomById(roomId);
          if (room?.adminId === userId) {
            io.to(roomId).emit('user-muted', targetUserId);
          }
        });

        socket.on('remove-user', async (targetUserId: string) => {
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

    // সিগনাল ইভেন্ট হ্যান্ডলিং
    socket.on('signal', (toId: string, signal: unknown) => {
      io.to(toId).emit('signal', socket.id, signal);
    });

    // ডিসকানেক্ট ইভেন্ট
   // websocket.ts এর disconnect ইভেন্টে
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