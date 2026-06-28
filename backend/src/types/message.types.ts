import { Document, Types } from 'mongoose';

export interface Message {
  _id: string;
  roomId: string;
  username: string;
  message: string;
  createdAt: Date;
}

export interface CreateMessageRequest {
  roomId: string;
  username: string;
  message: string;
}

export interface IMessageDoc extends Document {
  roomId: Types.ObjectId;
  username: string;
  message: string;
  createdAt: Date;
}
