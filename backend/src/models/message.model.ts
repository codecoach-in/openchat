import { Schema, model, Types } from 'mongoose';
import { IMessageDoc } from '../types/message.types';

const messageSchema = new Schema<IMessageDoc>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required.']
  },
  username: {
    type: String,
    required: [true, 'Username is required.'],
    trim: true,
    minlength: [3, 'Username must be between 3 and 20 characters.'],
    maxlength: [20, 'Username must be between 3 and 20 characters.']
  },
  message: {
    type: String,
    required: [true, 'Message text is required.'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const MessageModel = model<IMessageDoc>('Message', messageSchema);
