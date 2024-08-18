// src/chat/chat.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
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
  
      // Retrieve user information of the receiver
      const userReceiver = await this.profileUserRepository.findOne({ where: { user: { id: receiverId } } });
  
      // Retrieve receiver name from store (adjust to your store logic)
      let receiverName;
      const receiverStoreInfo = await this.storeRepository.findOne({ where: { userId: receiverId } });
  
      // Check if name exists in store, otherwise use the profile name
      if (receiverStoreInfo && receiverStoreInfo.companyName) {
        receiverName = receiverStoreInfo.companyName;
      } else if (userReceiver) {
        receiverName = userReceiver.name; // Fallback to name from profile
      } else {
        receiverName = 'Unknown'; // Fallback if no name is found at all
      }
  
      // Map the chat responses and add sender name
      const chatResponses = chats.map(chat => ({
        id: chat.id,
        text: chat.text,
        createdAt: chat.createdAt,
        position: chat.senderId === senderId ? 'right' : 'left',  //change position
        isRead: chat.isRead
      }));
  
      // Format the response as per the requested structure
      return {
        userReceiver: userReceiver ? {
          id: userReceiver.id,
          name: receiverName
        } : null,
        chat: chatResponses
      };
    } catch (error) {
      throw error;
    }
  }
  

  async create(chatData: Partial<Chat>, senderId: number): Promise<Chat> {
    if (!chatData || !senderId) {
      throw new BadRequestException('Missing chat data or sender ID');
    }
  
    const { receiverId } = chatData;
  
    if (!receiverId) {
      throw new BadRequestException('Missing receiver ID');
    }
  
    try {
      // Check if the receiver exists in the user table and is verified and active (status true)
      const receiver = await this.userRepository.findOne({
        where: { id: receiverId, is_verified: true }
      });
  
      if (!receiver) {
        throw new BadRequestException('Receiver not found or not verified');
      }
  
      // Proceed with creating the chat message
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

