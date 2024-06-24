

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Booking } from './entities/booking.entity';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { CustomerInformation } from './entities/customer-information.entity';
// import { JwtService } from 'src/utils/jwt/jwt.service';
// import { Catalog } from 'src/catalog/entities/catalog.entity';

// @Injectable()
// export class BookingService {
//   constructor(
//     @InjectRepository(Booking)
//     private bookingRepository: Repository<Booking>,
//     @InjectRepository(CustomerInformation)
//     private customerInformationRepository: Repository<CustomerInformation>,
//     @InjectRepository(Catalog)
//     private catalogRepository: Repository<Catalog>,
//     private readonly jwtService: JwtService
//   ) {}

//   async create(createBookingDto: CreateBookingDto): Promise<number> {
//     const { token, catalogId, name, email, phone, address, day, time } = createBookingDto;

//     const decoded = await this.jwtService.verifyJwtToken(token);

//     const catalog = await this.catalogRepository.findOne({ where: { id: catalogId } });
//     if (!catalog) {
//       throw new NotFoundException('Catalog not found');
//     }

//     const customerInformation = this.customerInformationRepository.create({
//       name,
//       email,
//       phone,
//       address,
//       day,
//       time,
//     });
//     await this.customerInformationRepository.save(customerInformation);

//     const booking = this.bookingRepository.create({
//       catalogId,
//       userBookingId: decoded.userId,
//       ownerId: catalog.ownerId,
//       status: 'Appointment',
//       customerInformation,
//     });

//     const savedBooking = await this.bookingRepository.save(booking);
//     return savedBooking.id;
//   }

//   findAll(): Promise<Booking[]> {
//     return this.bookingRepository.find({ relations: ['customerInformation'] });
//   }

//   async findOne(id: number): Promise<Booking> {
//     const booking = await this.bookingRepository.createQueryBuilder('booking')
//       .leftJoinAndSelect('booking.customerInformation', 'customerInformation')
//       .leftJoinAndSelect('booking.catalog', 'catalog')
//       .select([
//         'booking.id',
//         'booking.status',
//         'booking.catalogId',
//         'customerInformation.name',
//         'customerInformation.email',
//         'customerInformation.phone',
//         'customerInformation.address',
//         'customerInformation.day',
//         'customerInformation.time',
//         'catalog.id',
//         'catalog.name' // assuming you want to select specific fields from the catalog
//       ])
//       .where('booking.id = :id', { id })
//       .getOne();

//     if (!booking) {
//       throw new NotFoundException(`Booking with ID ${id} not found`);
//     }

//     return booking;
//   }

//   async remove(id: number): Promise<void> {
//     const result = await this.bookingRepository.delete(id);
//     if (result.affected === 0) {
//       throw new NotFoundException(`Booking with ID ${id} not found`);
//     }
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CustomerInformation } from './entities/customer-information.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
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

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { token, catalogId, name, email, phone, address, day, time } = createBookingDto;

    const decoded = await this.jwtService.verifyJwtToken(token);

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
      userBookingId: decoded.userId,
      ownerId: catalog.ownerId,
      status: 'Inprogress',
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
}
