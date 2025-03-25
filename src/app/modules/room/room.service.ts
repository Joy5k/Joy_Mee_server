import { RoomModel, IRoom, IParticipant } from './room.model';
import { Types } from 'mongoose';

export class RoomService {
  async createRoom(userId: string): Promise<IRoom> {
    const room = new RoomModel({
      adminId: userId,
      participants: [{
        userId,
        socketId: '',
        isAdmin: true
      }]
    });
    
    return await room.save();
  }

  async getRoomById(roomId: string): Promise<IRoom | null> {
    if (!Types.ObjectId.isValid(roomId)) return null;
    return await RoomModel.findById(roomId).exec();
  }

  async joinRoom(roomId: string, userId: string, socketId: string): Promise<IRoom> {
    const room = await RoomModel.findById(roomId);
    if (!room) throw new Error('Room not found');

    const participant: IParticipant = {
      userId,
      socketId,
      isAdmin: false,
      joinedAt: new Date()
    };

    room.participants.push(participant);
    return await room.save();
  }

  async leaveRoom(roomId: string, userId: string): Promise<IRoom> {
    const room = await RoomModel.findById(roomId);
    if (!room) throw new Error('Room not found');

    room.participants = room.participants.filter(p => p.userId !== userId);
    
    // If admin left, assign new admin
    if (room.adminId === userId && room.participants.length > 0) {
      room.adminId = room.participants[0].userId;
      room.participants[0].isAdmin = true;
    }

    return await room.save();
  }

  async updateSocketId(roomId: string, userId: string, socketId: string): Promise<void> {
    await RoomModel.updateOne(
      { _id: roomId, 'participants.userId': userId },
      { $set: { 'participants.$.socketId': socketId } }
    );
  }
}