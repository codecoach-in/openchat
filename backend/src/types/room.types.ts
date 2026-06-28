import { Document } from 'mongoose';

export interface Room {
  _id: string;
  roomName: string;
  createdAt: Date;
}

export interface CreateRoomRequest {
  roomName: string;
}

export interface IRoomDoc extends Document {
  roomName: string;
  createdAt: Date;
}
