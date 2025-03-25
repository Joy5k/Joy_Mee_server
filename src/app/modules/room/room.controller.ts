// src/modules/room/room.controller.ts
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { joinRoomValidation } from './room.validation';
import { RoomService } from './room.service';


  const createRoom = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.body;
    
    if (!userId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required');
    }

    const room = await RoomService.createRoom(userId);
    
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Room created successfully',
      data: {
        id: room._id,
        adminId: room.adminId,
        participants: room.participants
      }
    });
  });

  const joinRoom = catchAsync(async (req: Request, res: Response) => {
    const validationResult = joinRoomValidation.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map(err => `${err.path.join('.')} - ${err.message}`)
        .join(', ');
      throw new AppError(httpStatus.BAD_REQUEST, errorMessage);
    }

    const { roomId, userId } = req.body;
    const socketId = req.headers['x-socket-id'] as string || 'temp-socket-id';

    const room = await RoomService.joinRoom(roomId, userId, socketId);
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Joined room successfully',
      data: {
        id: room._id,
        adminId: room.adminId,
        participants: room.participants
      }
    });
  });

  export const RoomController={
    createRoom,
    joinRoom
  }
