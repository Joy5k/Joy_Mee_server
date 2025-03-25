// src/modules/room/room.routes.ts
import { Router } from 'express';
import { RoomController } from './room.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createRoomValidation, joinRoomValidation } from './room.validation';

const router = Router();


router.post('/rooms',validateRequest(createRoomValidation), RoomController.createRoom);
router.post('/rooms/join',validateRequest(joinRoomValidation), RoomController.joinRoom);

export default router;