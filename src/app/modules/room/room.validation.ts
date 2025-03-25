// src/modules/room/room.validation.ts
import { z } from 'zod';

export const createRoomValidation = z.object({
  userId: z.string().regex(/^[a-zA-Z0-9-]+$/).nonempty()
});

export const joinRoomValidation = z.object({
  roomId: z.string().regex(/^[a-fA-F0-9]{24}$/).nonempty(),
  userId: z.string().regex(/^[a-zA-Z0-9-]+$/).nonempty()
});