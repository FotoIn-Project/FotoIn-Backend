import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CustomerInformation } from './entities/customer-information.entity';
import { JwtService } from '@nestjs/jwt';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { Review } from 'src/catalog/entities/review.entity';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(CustomerInformation)
    private customerInformationRepository: Repository<CustomerInformation>,
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private readonly jwtService: JwtService
  ) {}

  async create(createBookingDto: CreateBookingDto, currentUserId: number): Promise<Booking> {
    try {
      this.logger.log(`[create] Creating a booking for user ${currentUserId}`);
      const { catalogId, name, email, phone, address, day, time } = createBookingDto;

      this.logger.log(`[create] Fetching catalog with ID ${catalogId}`);
      const catalog = await this.catalogRepository.findOne({ where: { id: catalogId } });
      if (!catalog) {
        throw new NotFoundException('Catalog not found');
      }

      this.logger.log('[create] Saving customer information');
      const customerInformation = this.customerInformationRepository.create({
        name,
        email,
        phone,
        address,
        day,
        time,
      });
      await this.customerInformationRepository.save(customerInformation);

      this.logger.log('[create] Creating and saving booking');
      const booking = this.bookingRepository.create({
        catalogId,
        userBookingId: currentUserId,
        ownerId: catalog.ownerId,
        status: 'Appointment',
        customerInformation,
      });

      return this.bookingRepository.save(booking);
    } catch (error) {
      this.logger.error(`[create] Failed to create booking: ${error.message}`, error.stack);
      throw error;
    }
  }

  findAll(): Promise<Booking[]> {
    this.logger.log('[findAll] Fetching all bookings');
    return this.bookingRepository.find({ relations: ['customerInformation'] });
  }

  async findOne(id: number): Promise<any> {
    try {
      this.logger.log(`[findOne] Fetching booking with ID ${id}`);
      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['customerInformation', 'catalog'],
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      this.logger.log(`[findOne] Calculating average rating for catalog ID ${booking.catalogId}`);
      const averageRating = await this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'averageRating')
        .where('review.catalogId = :catalogId', { catalogId: booking.catalogId })
        .getRawOne();

      return {
        ...booking,
        catalog: {
          ...booking.catalog,
          averageRating: parseFloat(averageRating.averageRating) || 0,
        },
      };
    } catch (error) {
      this.logger.error(`[findOne] Failed to fetch booking with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`[remove] Removing booking with ID ${id}`);
      const result = await this.bookingRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error(`[remove] Failed to remove booking with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async changeStatus(id: number, newStatus: string): Promise<Booking> {
    try {
      this.logger.log(`[changeStatus] Changing status of booking with ID ${id} to ${newStatus}`);
      const booking = await this.bookingRepository.findOne({where : { id}});
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      booking.status = newStatus;
      return this.bookingRepository.save(booking);
    } catch (error) {
      this.logger.error(`[changeStatus] Failed to change status of booking with ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByStatus(status: string, currentUserId: number): Promise<Booking[]> {
    try {
      this.logger.log(`[findByStatus] Fetching bookings with status ${status}`);
      const bookingByStatus = await this.bookingRepository.find({ where: { status : status, userBookingId: currentUserId }, relations: ['customerInformation', 'catalog'] });
      return bookingByStatus
  
    } catch (error) {
      this.logger.error(`[findByStatus] Failed to fetch bookings with status ${status}: ${error.message}`, error.stack);
      throw error;
    }
  }

  //edit booking

}
