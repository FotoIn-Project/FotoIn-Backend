import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, Query, UseGuards, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async create(@Body() createBookingDto: CreateBookingDto, @Req() req): Promise<any> {
    const currentUser = req.user;
    return this.bookingService.create(createBookingDto, currentUser.id).then(result => ({
      statusCode: 201,
      message: 'Booking created successfully',
      data: result
    }));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findOne(@Query('id') id: string): Promise<any> {
    const result = await this.bookingService.findOne(+id);
    return{
      statusCode: 200,
      message: 'Booking retrieved successfully',
      data: result
    }
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
