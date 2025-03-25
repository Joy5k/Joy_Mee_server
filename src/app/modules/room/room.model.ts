// src/modules/room/room.model.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IParticipant {
  userId: string;
  socketId: string;
  isAdmin: boolean;
  joinedAt: Date;
}

export interface IRoom extends Document {
  _id: Types.ObjectId; 
  adminId: string;
  participants: IParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  userId: { type: String, required: true },
  socketId: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now }
});

const RoomSchema = new Schema<IRoom>({
  adminId: { type: String, required: true },
  participants: [ParticipantSchema]
}, {
  timestamps: true,
  versionKey: false
});

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);