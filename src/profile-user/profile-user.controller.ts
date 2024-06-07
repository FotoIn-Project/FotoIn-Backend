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
  findByUserId(@Query('userId') userId: number) {
    return this.profileUserService.findByUserId(userId);
  }

  @Patch()
  async updateProfile(@Query('userId') id: string, @Body() updateProfileUserDto: UpdateProfileUserDto) {
      return this.profileUserService.update(+id, updateProfileUserDto);
  }

}
