// src/modules/room/room.validation.ts
import Joi from 'joi';

export const createRoomValidation = Joi.object({
  userId: Joi.string().required().pattern(/^[a-zA-Z0-9-]+$/)
});

export const joinRoomValidation = Joi.object({
  roomId: Joi.string().required().pattern(/^[a-fA-F0-9]{24}$/),
  userId: Joi.string().required().pattern(/^[a-zA-Z0-9-]+$/)
});