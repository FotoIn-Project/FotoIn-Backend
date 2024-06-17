import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { token, ...notificationData } = createNotificationDto;
    const decoded = await this.jwtService.verifyJwtToken(token);
    const userId = decoded.userId;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const notification = this.notificationRepository.create({
      ...notificationData,
      from: userId.toString(),
      createdBy: user.email,
      updatedBy: user.email,
    });

    return await this.notificationRepository.save(notification);
  }

  async findByTo(token: string): Promise<Notification[]> {
    const decoded = await this.jwtService.verifyJwtToken(token);
    const userId = decoded.userId;
    return await this.notificationRepository.find({ where: { to : userId } });
  }

  async update(id: number, token: string): Promise<Notification> {
    const decoded = await this.jwtService.verifyJwtToken(token);
    const userId = decoded.userId;
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
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

