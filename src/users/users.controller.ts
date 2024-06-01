import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from '@nestjs/common/pipes';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.createUser(createUserDto);
      return user;
    } catch (error) {
      throw error
    }
  }

  @Get()
  findAll() {
    console.log("oke");
    return {message : "Hello gais"};
    // return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(+id);
      return { message : "User delete successfully"}
    } catch (error) {
      throw error;
    }
  }
}
