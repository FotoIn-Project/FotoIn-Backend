import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  catalogId: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  day: string;

  @IsNotEmpty()
  time: string;
}
