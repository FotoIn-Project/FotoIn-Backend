// src/chat/chat.controller.ts
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':senderId/:receiverId')
  async findAllBySenderAndReceiver(
    @Param('senderId') senderId: number,
    @Param('receiverId') receiverId: number,
  ): Promise<Chat[]> {
    return this.chatService.findAllBySenderAndReceiver(senderId, receiverId);
  }

  @Post()
  async create(@Body() chat: Chat): Promise<Chat> {
    return this.chatService.create(chat);
  }
}
