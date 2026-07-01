import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.service';

export class RoomController {
  static async getRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("RoomController in getRooms BE !");
      const rooms = await RoomService.getAllRooms();
      console.log("RoomController after getRooms BE ", rooms);
      res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
      console.log("error in getRooms BE ", error);
      next(error);
    }
  }

  static async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("in getRoomById BE !");
      const { id } = req.params;
      console.log("after getRoomById BE ", id);
      const room = await RoomService.getRoomById(id);
      console.log("after getRoomById BE ", room);
      if (!room) {
        res.status(404);
        throw new Error('Room not found.');
      }
      res.status(200).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  }

  static async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomName } = req.body;
      if (!roomName) {
        res.status(400);
        throw new Error('Room name is required.');
      }

      // Check if room name already exists
      const exists = await RoomService.roomExists(roomName);
      if (exists) {
        res.status(400);
        throw new Error('Room already exists.');
      }

      const room = await RoomService.createRoom({ roomName });
      res.status(201).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  }
}
