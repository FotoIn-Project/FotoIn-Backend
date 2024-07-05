import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createNotificationDto: CreateNotificationDto, currentUserId: number): Promise<Notification> {
    const { ...notificationData } = createNotificationDto;

    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!user) {
      throw new Error('User not found');
    }

    const notification = this.notificationRepository.create({
      ...notificationData,
      from: currentUserId,
      createdBy: user.email,
      updatedBy: user.email,
    });

    return await this.notificationRepository.save(notification);
  }

  async findByTo(currentUserId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({ where: { to : currentUserId } });
  }

  async update(id: number, currentUserId: number): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.updatedBy = user.email;

    await this.notificationRepository.save(notification);
    return notification;
  }
}

