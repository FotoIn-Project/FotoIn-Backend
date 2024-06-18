import { IsEmail, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class VerifyAccountDto {
  @IsEmail()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  verificationCode: number;
}
