import { RoomModel } from '../models/room.model';
import { CreateRoomRequest, IRoomDoc } from '../types/room.types';

export class RoomService {
  static async getAllRooms(): Promise<IRoomDoc[]> {
    return RoomModel.find().sort({ roomName: 1 });
  }

  static async getRoomById(id: string): Promise<IRoomDoc | null> {
    return RoomModel.findById(id);
  }

  static async createRoom(roomData: CreateRoomRequest): Promise<IRoomDoc> {
    const newRoom = new RoomModel({
      roomName: roomData.roomName.trim()
    });
    return newRoom.save();
  }

  static async roomExists(roomName: string): Promise<boolean> {
    const count = await RoomModel.countDocuments({
      roomName: { $regex: new RegExp(`^${roomName.trim()}$`, 'i') }
    });
    return count > 0;
  }
}
