// src/modules/room/room.controller.ts
import { Request, Response } from 'express';
import { RoomService } from './room.service';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { createRoomValidation, joinRoomValidation } from './room.validation';

export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  async createRoom(req: Request, res: Response) {
    const { error } = createRoomValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const room = await this.roomService.createRoom(req.body.userId);
      res.status(201).json({
        id: room._id,
        adminId: room.adminId,
        participants: room.participants
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create room' });
    }
  }

  async joinRoom(req: Request, res: Response) {
    const { error } = joinRoomValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      // In real app, socketId would come from WebSocket connection
      const room = await this.roomService.joinRoom(
        req.body.roomId,
        req.body.userId,
        'temp-socket-id'
      );
      
      res.json({
        id: room._id,
        adminId: room.adminId,
        participants: room.participants
      });
    } catch (error: unknown) {
     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to join room');
    }
  }
} 
