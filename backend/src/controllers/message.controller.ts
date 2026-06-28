import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';
import { RoomService } from '../services/room.service';

export class MessageController {
  static async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      
      // Verify room exists
      const room = await RoomService.getRoomById(roomId);
      if (!room) {
        res.status(404);
        throw new Error('Room not found.');
      }

      const messages = await MessageService.getMessagesByRoom(roomId);
      res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (error) {
      next(error);
    }
  }

  static async createMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId, username, message } = req.body;
      if (!roomId || !username || !message) {
        res.status(400);
        throw new Error('Room ID, username, and message text are required.');
      }

      // Verify room exists
      const room = await RoomService.getRoomById(roomId);
      if (!room) {
        res.status(404);
        throw new Error('Room not found.');
      }

      const savedMessage = await MessageService.saveMessage({ roomId, username, message });
      res.status(201).json({ success: true, data: savedMessage });
    } catch (error) {
      next(error);
    }
  }
}
