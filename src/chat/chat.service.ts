// src/chat/chat.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,
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
  
      // Retrieve user information of the receiver (you can adjust this as per your user retrieval logic)
      const userReceiver = await this.profileUserRepository.findOne({where : { user : { id : receiverId}}});       
  
      // Map the chat responses and add sender name
      const chatResponses = chats.map(chat => ({
        id: chat.id,
        text: chat.text,
        createdAt: chat.createdAt,
        position: chat.senderId === senderId ? 'left' : 'right',
        isRead: chat.isRead
      }));
  
      // Format the response as per the requested structure
      return {
          userReceiver: userReceiver ? {
            id: userReceiver.id,
            name: userReceiver.company_name,
          } : null,
          chat: chatResponses
      }
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

