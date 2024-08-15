// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';
import { User } from 'src/users/entities/user.entity';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';
import { Store } from 'src/store/entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, User, ProfileUser, Store])],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}

