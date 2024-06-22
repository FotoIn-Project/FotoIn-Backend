// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async findAllBySenderAndReceiver(senderId: number, receiverId: number): Promise<Chat[]> {
    return this.chatRepository.find({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ],
      order: {
        createdAt: 'ASC'
      }
    });
  }

  async create(chatData: Partial<Chat>): Promise<Chat> {
    const chat = this.chatRepository.create(chatData);
    return this.chatRepository.save(chat);
  }
}
