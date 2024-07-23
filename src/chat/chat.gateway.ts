import { UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(@ConnectedSocket() client: Socket, payload: Partial<Chat>) {
      // Assuming the senderId is now part of the client object after successful authentication
      const senderId = client.data.senderId; // Adjust this according to how you attach the user info
      console.log(senderId);
      
      const message = await this.chatService.create(payload, senderId);
      this.server.emit('message', message);
  }
}
