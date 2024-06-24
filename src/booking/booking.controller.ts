import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createBookingDto: CreateBookingDto): Promise<any> {
    return this.bookingService.create(createBookingDto).then(result => ({
      statusCode: 201,
      message: 'Booking created successfully',
      data: {
        bookingId : result
      }
    }));
  }

  @Get()
  findOne(@Query('id') id: string): Promise<Booking> {
    return this.bookingService.findOne(+id);
  }

  @Get()
  findAll(): Promise<Booking[]> {
    return this.bookingService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingService.remove(+id);
  }
}
