import { Module } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { ProfileUserController } from './profile-user.controller';
import { ProfileUser } from './entities/profile-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileUser, User]),],
  controllers: [ProfileUserController],
  providers: [ProfileUserService, ConfigService],
})
export class ProfileUserModule {}
