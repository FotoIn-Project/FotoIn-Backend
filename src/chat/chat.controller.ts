// src/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('group-chat')
  @UseGuards(JwtAuthGuard)
  async getLastChatsBySender(@Req() req): Promise<any> {
    const senderId = req.user.id;
    if (!senderId) {
      throw new BadRequestException('Missing sender ID');
    }
    const result = await this.chatService.findLastChatBySender(senderId);
    return {
      statuscode: 200,
      message: 'Last chat messages retrieved successfully',
      data: result,
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllBySenderAndReceiver(
    @Query('receiverId') receiverId: number,
    @Req() req,
  ): Promise<any> {
    const currentUser = req.user;
    const result = await this.chatService.findAllBySenderAndReceiver(
      currentUser.id,
      receiverId,
    );
    return {
      statuscode: 200,
      message: 'Chat messages retrieved successfully',
      data: result,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() chat: Chat, @Req() req): Promise<any> {
    const currentUser = req.user;
    const result = await this.chatService.create(chat, currentUser.id);
    return {
      statuscode: 201,
      message: 'Chat message created successfully',
      data: result,
    };
  }
}
