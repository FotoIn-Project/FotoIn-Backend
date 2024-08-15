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
import { CatalogService } from 'src/catalog/catalog.service';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Injectable()
export class ProfileUserService {
  private readonly logger = new Logger(ProfileUserService.name);

  constructor(
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Portofolio)
    private portfolioRepository: Repository<Portofolio>,

    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private catalogService : CatalogService
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

  async findProfileByUserId(currentUserId: number): Promise<any> {
    try {
      this.logger.log(`[findProfileByUserId] Fetching profile for user ${currentUserId}`);
  
      const profile = await this.profileUserRepository.findOne({
        where: { user: { id: currentUserId } },
      });
  
      if (!profile) {
        throw new Error(`Profile not found for user ${currentUserId}`);
      }
  
      const countCatalog = await this.catalogService.findbyOwner(currentUserId);
      const countPorto = await this.getPortfoliosByOwnerId(currentUserId)
      
      //booking
      const bookingAccepted = await this.bookingRepository.find({ where: { status: "Accepted", ownerId: currentUserId }})
      const bookingAppointment = await this.bookingRepository.find({ where: { status: "Appointment", ownerId: currentUserId }})
      const bookingCanceled = await this.bookingRepository.find({ where: { status: "Canceled", ownerId: currentUserId }})
      const bookingDone = await this.bookingRepository.find({ where: { status: "Done", ownerId: currentUserId }})
  
      // Adding countCatalog to the profile response
      const profileWithCatalog = {
        ...profile,
        countCatalog : countCatalog.length,
        countPorto : countPorto.length,
        bookingAccepted,
        bookingAppointment,
        bookingCanceled,
        bookingDone
      };
  
      return profileWithCatalog;
    } catch (error) {
      this.logger.error(`[findProfileByUserId] Failed to fetch profile for user ${currentUserId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPortfoliosByOwnerId(ownerId: number): Promise<Portofolio[]> {
    try {
      this.logger.log(`[getPortfoliosByOwnerId] Fetching portfolios for owner ${ownerId}`);
      
      const portfolios = await this.portfolioRepository.find({
        where: { ownerId: ownerId },
      });
  
      if (!portfolios || portfolios.length === 0) {
        this.logger.warn(`[getPortfoliosByOwnerId] No portfolios found for owner ${ownerId}`);
        return [];
      }
  
      return portfolios;
    } catch (error) {
      this.logger.error(`[getPortfoliosByOwnerId] Failed to fetch portfolios for owner ${ownerId}: ${error.message}`, error.stack);
      throw error;
    }
  }
  
}
