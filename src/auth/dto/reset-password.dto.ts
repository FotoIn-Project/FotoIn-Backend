// reset-password.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsNumber()
  resetToken: number;
}
