import { Controller, Get, Param, Body, ValidationPipe } from '@nestjs/common';
import { Post, UsePipes } from '@nestjs/common/decorators';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sign-up')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      return await this.usersService.createUser(createUserDto);
    } catch (error) {
        console.log(error);    
        throw error;
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginUserDto : LoginUserDto ): Promise<any> {
    try {
      return await this.authService.login(loginUserDto);
    } catch (error) {
        console.log(error);
        throw error;
    }
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() forgotPassword : ForgotPasswordDto ): Promise<any> {
    try {
      return await this.authService.forgotPassword(forgotPassword);
    } catch (error) {
        console.log(error);
        throw error;
    }
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() resetPassword : ResetPasswordDto ): Promise<any> {
    try {
      return await this.authService.resetPassword(resetPassword);
    } catch (error) {
        console.log(error);
        throw error;
    }
  }
  
}
