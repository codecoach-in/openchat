import { Schema, model } from 'mongoose';
import { IRoomDoc } from '../types/room.types';

const roomSchema = new Schema<IRoomDoc>({
  roomName: {
    type: String,
    required: [true, 'Room name is required.'],
    unique: true,
    trim: true,
    minlength: [3, 'Room name must be between 3 and 30 characters.'],
    maxlength: [30, 'Room name must be between 3 and 30 characters.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const RoomModel = model<IRoomDoc>('Room', roomSchema);
