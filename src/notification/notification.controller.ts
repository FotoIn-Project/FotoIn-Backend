import { Controller, Get, Post, Param, Body, Patch, ValidationPipe, UsePipes, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponse } from './interface/notification-response.interface';
import { Notification } from './entities/notification.entity';
import { query } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationResponse<Notification>> {
    const result = await this.notificationService.create(createNotificationDto);
    return {
      statusCode: 201,
      message: 'Notification created successfully',
      data: result,
    };
  }

  @Get('to')
  async findByTo(@Query('token') token: string): Promise<any> {
    const notifications = await this.notificationService.findByTo(token);
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
  async update(@Query('id') id: number, @Query('token') token: string): Promise<NotificationResponse<Notification>> {
    const updatedNotification = await this.notificationService.update(id, token);
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

