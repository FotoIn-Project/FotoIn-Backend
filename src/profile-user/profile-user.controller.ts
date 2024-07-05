import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { Req, UseGuards, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from '@nestjs/common/pipes';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@Controller('profile-user')
export class ProfileUserController {
  constructor(private readonly profileUserService: ProfileUserService) {}


  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUserId(@Req() req) {
    const currentUser = req.user;
    const result = await this.profileUserService.findProfileByUserId(currentUser.id);
    return {
      statusCode: 200,
      message: 'Profile User retrieved successfully',
      data: result
    };
    
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(@Body() updateProfileUserDto: UpdateProfileUserDto,  @Req() req) {
    const currentUser = req.user;
      return this.profileUserService.updateProfile( updateProfileUserDto, currentUser.id);
  }

}
