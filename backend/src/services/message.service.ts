import { MessageModel } from '../models/message.model';
import { CreateMessageRequest, IMessageDoc } from '../types/message.types';
import { Types } from 'mongoose';

export class MessageService {
  static async getMessagesByRoom(roomId: string): Promise<IMessageDoc[]> {
    return MessageModel.find({ roomId: new Types.ObjectId(roomId) })
      .sort({ createdAt: 1 })
      .populate('roomId', 'roomName');
  }

  static async saveMessage(msgData: CreateMessageRequest): Promise<IMessageDoc> {
    const newMessage = new MessageModel({
      roomId: new Types.ObjectId(msgData.roomId),
      username: msgData.username.trim(),
      message: msgData.message.trim()
    });
    const saved = await newMessage.save();
    return saved.populate('roomId', 'roomName');
  }
}
