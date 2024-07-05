import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { CustomerInformation } from './entities/customer-information.entity';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { ConfigService } from '@nestjs/config';
import { Review } from 'src/catalog/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, CustomerInformation, Catalog, Review])],
  controllers: [BookingController],
  providers: [BookingService, ConfigService],
})
export class BookingModule {}
