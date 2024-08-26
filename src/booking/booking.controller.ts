import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
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
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req,
  ): Promise<any> {
    const currentUser = req.user;
    return this.bookingService
      .create(createBookingDto, currentUser.id)
      .then((result) => ({
        statusCode: 201,
        message: 'Booking created successfully',
        data: result,
      }));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findOne(@Query('id') id: string): Promise<any> {
    const result = await this.bookingService.findOne(+id);
    return {
      statusCode: 200,
      message: 'Booking retrieved successfully',
      data: result,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<Booking[]> {
    return this.bookingService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingService.remove(+id);
  }

  @Patch('/update-status')
  @UseGuards(JwtAuthGuard)
  async changeStatus(
    @Query('id') id: number,
    @Body('status') newStatus: string,
  ): Promise<any> {
    const result = await this.bookingService.changeStatus(id, newStatus);
    return {
      statusCode: 200,
      message: 'Update status successfully',
      data: result,
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async findByStatus(
    @Query('status') status: string,
    @Query('type') type: number,
    @Req() req,
  ) {
    const currentUser = req.user;
    const bookings = await this.bookingService.findByStatus(
      status,
      type,
      currentUser.id,
    );
    return {
      statusCode: 200,
      message: 'Bookings retrieved successfully',
      data: bookings,
    };
  }
}
