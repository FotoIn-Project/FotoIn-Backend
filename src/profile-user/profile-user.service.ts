import {
  Injectable,
  UnauthorizedException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { ProfileUser } from './entities/profile-user.entity';

@Injectable()
export class ProfileUserService {
  private readonly logger = new Logger(ProfileUserService.name);

  constructor(
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updateProfile(updateProfileUserDto: UpdateProfileUserDto, currentUserId: number): Promise<any> {
    try {
      this.logger.log(`[updateProfile] Updating profile for user ${currentUserId}`);
      const { ...updateData } = updateProfileUserDto;

      this.logger.log(`[updateProfile] Fetching user with ID ${currentUserId}`);
      const user = await this.userRepository.findOne({ where: { id: currentUserId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      this.logger.log(`[updateProfile] Fetching profile for user with ID ${currentUserId}`);
      const profile = await this.profileUserRepository.findOne({ where: { user: { id: currentUserId } } });
      if (!profile) {
        throw new UnauthorizedException('Profile not found');
      }

      this.logger.log(`[updateProfile] Updating profile for user ${currentUserId}`);
      updateData.updated_by = user.email;
      Object.assign(profile, updateData);
      await this.profileUserRepository.save(profile);

      this.logger.log(`[updateProfile] Profile updated successfully for user ${currentUserId}`);
      return { message: 'Update profile successfully', statusCode: 200 };
    } catch (error) {
      this.logger.error(`[updateProfile] Failed to update profile for user ${currentUserId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findProfileByUserId(currentUserId: number): Promise<ProfileUser> {
    try {
      this.logger.log(`[findProfileByUserId] Fetching profile for user ${currentUserId}`);
      return await this.profileUserRepository.findOne({
        where: { user: { id: currentUserId } },
      });
    } catch (error) {
      this.logger.error(`[findProfileByUserId] Failed to fetch profile for user ${currentUserId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
