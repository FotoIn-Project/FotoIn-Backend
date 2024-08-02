import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CustomerInformation } from './entities/customer-information.entity';
// import { JwtService } from 'src/utils/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { Review } from 'src/catalog/entities/review.entity';

@Injectable()
export class BookingService {
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
    const { catalogId, name, email, phone, address, day, time } = createBookingDto;

    const catalog = await this.catalogRepository.findOne({ where: { id: catalogId } });
    if (!catalog) {
      throw new NotFoundException('Catalog not found');
    }

    const customerInformation = this.customerInformationRepository.create({
      name,
      email,
      phone,
      address,
      day,
      time,
    });
    await this.customerInformationRepository.save(customerInformation);

    const booking = this.bookingRepository.create({
      catalogId,
      userBookingId: currentUserId,
      ownerId: catalog.ownerId,
      status: 'Appointment',
      customerInformation,
    });

    return this.bookingRepository.save(booking);
  }

  findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ relations: ['customerInformation'] });
  }

  async findOne(id: number): Promise<any> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['customerInformation', 'catalog'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

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
  }


  async remove(id: number): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }

  async changeStatus(id: number, newStatus: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({where : { id}});
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = newStatus;
    return this.bookingRepository.save(booking);
  }

  async findByStatus(status: string): Promise<Booking[]> {
    return this.bookingRepository.find({ where: { status }, relations: ['customerInformation', 'catalog'] });
  }
}
