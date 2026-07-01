import { RoomModel } from '../models/room.model';
import { CreateRoomRequest, IRoomDoc } from '../types/room.types';

export class RoomService {
  static async getAllRooms(): Promise<IRoomDoc[]> {
    console.log("RoomService in getAllRooms Service!");
    const result = await RoomModel.find().sort({ roomName: 1 });
    console.log("RoomService after getAllRooms Service", result);
    return result;
  }

  static async getRoomById(id: string): Promise<IRoomDoc | null> {
    console.log("RoomService in getRoomById Service!");
    const result = await RoomModel.findById(id);
    console.log("after getRoomById Service", result);
    return result;
  }

  static async createRoom(roomData: CreateRoomRequest): Promise<IRoomDoc> {
    console.log("in createRoom Service!");
    const newRoom = new RoomModel({
      roomName: roomData.roomName.trim()
    });
    const result = await newRoom.save();
    console.log("after createRoom Service", result);
    return result;
  }

  static async roomExists(roomName: string): Promise<boolean> {
    console.log("in roomExists Service!");
    const count = await RoomModel.countDocuments({
      roomName: { $regex: new RegExp(`^${roomName.trim()}$`, 'i') }
    });
    console.log("after roomExists Service", count);
    return count > 0;
  }
}
