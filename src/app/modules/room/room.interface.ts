// src/modules/room/room.interface.ts
import { Document } from 'mongoose';
import { IRoom } from './room.model';

export type RoomDocument = IRoom & Document;
export type ParticipantDocument = IRoom['participants'][number] & Document;

export interface CreateRoomPayload {
  userId: string;
}

export interface JoinRoomPayload {
  roomId: string;
  userId: string;
}