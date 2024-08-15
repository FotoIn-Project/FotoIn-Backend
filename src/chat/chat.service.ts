// src/chat/chat.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { serialize } from 'v8';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getChatsByRoom(senderId: number, receiverId: number): Promise<any> {
    try {
      // Fetching the chats between the sender and receiver
      const chats = await this.chatRepository.find({
        where: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId }
        ],
        order: { createdAt: 'ASC' }
      });
  
      // Get sender and receiver user details in parallel
      const sender = await this.userRepository.findOne({ where : { id : senderId}});
      const receiver = await this.userRepository.findOne({ where : { id : receiverId}});
  
      // Map the chat responses and add sender name
      const chatResponses = await Promise.all(chats.map(async chat => {
        const senderName = chat.senderId === senderId ? sender.profile.company_name : receiver.profile.company_name;
        return {
          id: chat.id,
          text: chat.text,
          createdAt: chat.createdAt,
          position: chat.senderId === senderId ? 'left' : 'right',
          senderName: senderName,
          isRead: chat.isRead
        };
      }));
  
      return chatResponses;
    } catch (error) {
      throw error;
    }
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

  async markChatsAsRead(senderId: number, receiverId: number): Promise<any> {
    return this.chatRepository.update(
      { senderId, receiverId, isRead: false }, // Update only unread messages
      { isRead: true },
    );
  }
}

