import { Controller, Get, Post, Body, Patch, ValidationPipe, UsePipes, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponse } from './interface/notification-response.interface';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createNotificationDto: CreateNotificationDto, @Req() req): Promise<NotificationResponse<Notification>> {
    const currentUser = req.user;
    const result = await this.notificationService.create(createNotificationDto, currentUser.id);
    return {
      statusCode: 201,
      message: 'Notification created successfully',
      data: result,
    };
  }

  @Get('to')
  @UseGuards(JwtAuthGuard)
  async findByTo(@Req() req): Promise<any> {
    const currentUser = req.user;
    const notifications = await this.notificationService.findByTo(currentUser.id);
    const transformedNotifications = notifications.map(notification => ({
      ...notification,
      elapsedTime: this.getElapsedTime(notification.createdAt),
    }));
    return {
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: transformedNotifications,
    };
  }

  @Patch('read')
  @UseGuards(JwtAuthGuard)
  async update(@Query('id') id: number, @Req() req): Promise<NotificationResponse<Notification>> {
    const currentUser = req.user;
    const updatedNotification = await this.notificationService.update(id, currentUser.id);
    return {
      statusCode: 200,
      message: 'Notification updated successfully',
      data: updatedNotification,
    };
  }

  private getElapsedTime(createdAt: Date): string {
    const now = new Date();
    const elapsed = now.getTime() - new Date(createdAt).getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return `${seconds} seconds ago`;
  }
}

