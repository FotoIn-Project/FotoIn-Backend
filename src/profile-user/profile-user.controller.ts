import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { CreateProfileUserDto } from './dto/create-profile-user.dto';
import { Query, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from '@nestjs/common/pipes';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';

@Controller('profile-user')
export class ProfileUserController {
  constructor(private readonly profileUserService: ProfileUserService) {}


  @Get()
  findByUserId(@Query('token') token: string) {
    return this.profileUserService.findProfileByUserId(token);
  }

  @Patch()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(@Body() updateProfileUserDto: UpdateProfileUserDto) {
      return this.profileUserService.updateProfile( updateProfileUserDto);
  }

}
