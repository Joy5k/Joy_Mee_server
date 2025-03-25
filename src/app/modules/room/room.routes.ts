// src/modules/room/room.routes.ts
import { Router } from 'express';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

const router = Router();
const roomService = new RoomService();
const roomController = new RoomController(roomService);

router.post('/rooms', roomController.createRoom.bind(roomController));
router.post('/rooms/join', roomController.joinRoom.bind(roomController));

export default router;