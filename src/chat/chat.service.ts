// src/chat/chat.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
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

  async create(chatData: Partial<Chat>, senderId: number): Promise<Chat> {

    if (!chatData || !senderId) {
      throw new BadRequestException('Missing chat data or sender ID');
    }

    try {
      const chat = this.chatRepository.create({
        ...chatData,
        senderId,
      });
      return await this.chatRepository.save(chat);
    } catch (error) {
      console.log(error);
      
      // Log the error or handle it as needed
      throw new BadRequestException('Failed to create chat message');
    }
  }

  async findLastChatBySender(senderId: number): Promise<Chat[]> {
    const subQuery = this.chatRepository
      .createQueryBuilder('chat')
      .select('MAX(chat.createdAt)', 'maxCreatedAt')
      .addSelect('chat.receiverId', 'receiverId')
      .where('chat.senderId = :senderId', { senderId })
      .groupBy('chat.receiverId')
      .getQuery();

    const result = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin(
        `(${subQuery})`,
        'lastChat',
        'chat.receiverId = lastChat.receiverId AND chat.createdAt = lastChat.maxCreatedAt'
      )
      .where('chat.senderId = :senderId', { senderId })
      .orderBy('chat.createdAt', 'DESC')
      .getMany();

    return result;
  }
}

